-- Run this in Supabase SQL Editor to update venue addresses with correct addresses and zip codes

UPDATE venues SET address = '729 N 14th St', city = 'Omaha', state = 'NE', zip = '68102' WHERE id = 'theslowdown';
UPDATE venues SET address = '6212 Maple St', city = 'Omaha', state = 'NE', zip = '68104' WHERE id = 'waitingroom';
UPDATE venues SET address = '6121 Military Ave', city = 'Omaha', state = 'NE', zip = '68104' WHERE id = 'reverblounge';
UPDATE venues SET address = '1415 O St', city = 'Lincoln', state = 'NE', zip = '68508' WHERE id = 'bourbontheatre';
UPDATE venues SET address = '2234 S 13th St', city = 'Omaha', state = 'NE', zip = '68108' WHERE id = 'admiral';
UPDATE venues SET address = '8302 City Centre Dr', city = 'La Vista', state = 'NE', zip = '68128' WHERE id = 'astrotheater';
UPDATE venues SET address = '1100 Dodge St', city = 'Omaha', state = 'NE', zip = '68102' WHERE id = 'steelhouse';
UPDATE venues SET address = '1200 Douglas St', city = 'Omaha', state = 'NE', zip = '68102' WHERE id = 'holland';
UPDATE venues SET address = '409 S 16th St', city = 'Omaha', state = 'NE', zip = '68102' WHERE id = 'orpheum';
UPDATE venues SET address = '225 N 170th St', city = 'Omaha', state = 'NE', zip = '68118' WHERE id = 'barnato';
UPDATE venues SET address = '2425 S 67th St', city = 'Omaha', state = 'NE', zip = '68182' WHERE id = 'baxterarena';
UPDATE venues SET address = '1 Harrahs Blvd', city = 'Council Bluffs', state = 'IA', zip = '51501' WHERE id = 'stircove';

-- Also update the venues from add_venues.sql
UPDATE venues SET address = '455 N 10th St', city = 'Omaha', state = 'NE', zip = '68102' WHERE id = 'chi-health-center';
UPDATE venues SET address = '400 Pinnacle Arena Dr', city = 'Lincoln', state = 'NE', zip = '68508' WHERE id = 'pinnacle-bank-arena';
UPDATE venues SET address = '4000 S 80th St', city = 'Lincoln', state = 'NE', zip = '68516' WHERE id = 'pinewood-bowl';
UPDATE venues SET address = '1 Memorial Stadium Dr', city = 'Lincoln', state = 'NE', zip = '68588' WHERE id = 'memorial-stadium';
UPDATE venues SET address = '140 N 13th St', city = 'Lincoln', state = 'NE', zip = '68508' WHERE id = 'rococo-theatre';
