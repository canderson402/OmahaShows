# scraper/tests/test_sync.py
"""upsert_events keeps a venue's upcoming shows in sync with its site."""
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test")

import run_scrape_supabase as runner
from models import Event


class FakeQuery:
    def __init__(self, db, table):
        self.db, self.table, self.filters, self.op, self.payload = db, table, [], "select", None

    def select(self, *_args, **_kwargs):
        return self

    def update(self, payload):
        self.op, self.payload = "update", payload
        return self

    def insert(self, payload):
        self.op, self.payload = "insert", payload
        return self

    def eq(self, col, val):
        self.filters.append(lambda r: r.get(col) == val)
        return self

    def gt(self, col, val):
        self.filters.append(lambda r: r.get(col) is not None and r.get(col) > val)
        return self

    def gte(self, col, val):
        self.filters.append(lambda r: r.get(col) is not None and r.get(col) >= val)
        return self

    def in_(self, col, vals):
        self.filters.append(lambda r: r.get(col) in vals)
        return self

    def execute(self):
        rows = self.db.setdefault(self.table, [])
        if self.op == "insert":
            rows.append(dict(self.payload))
            return type("R", (), {"data": [self.payload]})
        matched = [r for r in rows if all(f(r) for f in self.filters)]
        if self.op == "update":
            for r in matched:
                r.update(self.payload)
        return type("R", (), {"data": [dict(r) for r in matched]})


class FakeSupabase:
    def __init__(self, events):
        self.db = {"events": [dict(e) for e in events]}

    def table(self, name):
        return FakeQuery(self.db, name)

    def events(self):
        return {e["id"]: e for e in self.db["events"]}


def day(n):
    return (date.today() + timedelta(days=n)).isoformat()


def row(id, title, n, status="approved", source="theslowdown"):
    return {"id": id, "title": title, "date": day(n), "venue_id": "theslowdown",
            "source": source, "status": status}


def scraped(id, title, n):
    return Event(id=id, title=title, date=day(n), venue="Slowdown", source="theslowdown")


@pytest.fixture
def db(monkeypatch):
    def install(rows):
        fake = FakeSupabase(rows)
        monkeypatch.setattr(runner, "supabase", fake)
        return fake
    return install


def test_renamed_headliner_updates_the_existing_show(db):
    fake = db([row("joyer", "Joyer", 4), row("other", "Other Band", 5)])
    new, changed, removed = runner.upsert_events(
        [scraped("amph", "Amphibaphobia", 4), scraped("other", "Other Band", 5)],
        "theslowdown", auto_approve=True,
    )
    events = fake.events()
    assert (new, removed) == ([], [])
    assert changed == ["joyer"]
    assert "amph" not in events
    assert events["joyer"]["title"] == "Amphibaphobia"
    assert events["joyer"]["status"] == "approved"


def test_show_gone_from_site_is_removed(db):
    fake = db([row("a", "Band A", 4), row("b", "Band B", 5), row("c", "Band C", 6)])
    new, changed, removed = runner.upsert_events(
        [scraped("a", "Band A", 4), scraped("c", "Band C", 6)], "theslowdown",
    )
    assert removed == ["b"]
    assert fake.events()["b"]["status"] == "removed"


def test_two_rooms_swapped_same_night_removes_and_inserts(db):
    fake = db([row("a", "Band A", 4), row("b", "Band B", 4), row("z", "Zed", 9)])
    new, changed, removed = runner.upsert_events(
        [scraped("c", "Cats Quartet", 4), scraped("d", "Dogs Trio", 4), scraped("z", "Zed", 9)],
        "theslowdown",
    )
    assert sorted(new) == ["c", "d"]
    assert sorted(removed) == ["a", "b"]


def test_removed_show_comes_back_when_relisted(db):
    fake = db([row("a", "Band A", 4, status="removed")])
    new, changed, removed = runner.upsert_events([scraped("a", "Band A", 4)], "theslowdown", auto_approve=True)
    assert changed == ["a"]
    assert fake.events()["a"]["status"] == "approved"


def test_leaves_today_submissions_and_rejected_alone(db):
    fake = db([
        row("today", "Tonight Band", 0),
        row("submitted", "Submitted Show", 4, source="submission"),
        row("rejected", "Rejected Show", 4, status="rejected"),
        row("keep", "Keep Band", 5),
    ])
    new, changed, removed = runner.upsert_events([scraped("keep", "Keep Band", 5)], "theslowdown")
    assert removed == []
    events = fake.events()
    assert events["today"]["status"] == "approved"
    assert events["submitted"]["status"] == "approved"
    assert events["rejected"]["status"] == "rejected"


def test_half_broken_scrape_removes_nothing(db):
    rows = [row(f"s{i}", f"Show Number{i}", i + 1) for i in range(10)]
    fake = db(rows)
    new, changed, removed = runner.upsert_events([scraped("s0", "Show Number0", 1)], "theslowdown")
    assert removed == []
    assert all(e["status"] == "approved" for e in fake.events().values())
