module.exports = [
"[project]/Dev/ShowCal/web/src/components/EventCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// web/src/components/EventCard.tsx
__turbopack_context__.s([
    "EventCard",
    ()=>EventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function EventCard({ event, venueColors }) {
    const formatDateOverlay = (dateStr)=>{
        const date = new Date(dateStr + "T00:00:00");
        const weekday = date.toLocaleDateString("en-US", {
            weekday: "short"
        });
        const month = date.toLocaleDateString("en-US", {
            month: "short"
        });
        const day = date.getDate();
        return `${weekday} ${month} ${day}`;
    };
    const formatTime = (timeStr)=>{
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    // Use eventUrl for listing, fall back to ticketUrl
    const listingUrl = event.eventUrl || event.ticketUrl;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "group py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3",
                children: [
                    listingUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: listingUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-2xl font-bold text-white hover:text-blue-400 transition-colors",
                        children: event.title
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-2xl font-bold text-white",
                        children: event.title
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    event.supportingArtists && event.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 mt-1",
                        children: [
                            "with ",
                            event.supportingArtists.join(", ")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative overflow-hidden rounded-2xl",
                children: [
                    event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: event.imageUrl,
                        alt: event.title,
                        className: "w-full h-auto"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full aspect-video bg-gray-800 flex items-center justify-center rounded-2xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-gray-600 text-6xl",
                            children: "♪"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-white font-semibold text-sm",
                            children: formatDateOverlay(event.date)
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-3 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-gray-400 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: formatTime(event.time) || "TBA"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-600",
                                children: "·"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this),
                            event.venueUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: event.venueUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "hover:underline",
                                style: {
                                    color: venueColors?.[event.source] || "#9ca3af"
                                },
                                children: event.venue
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: venueColors?.[event.source] || "#9ca3af"
                                },
                                children: event.venue
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            event.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: event.price
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                        lineNumber: 99,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            event.ageRestriction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: event.ageRestriction
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 flex-shrink-0",
                        children: [
                            event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: event.eventUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "px-3 py-1.5 bg-gray-800 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors",
                                children: "View Listing"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, this),
                            event.ticketUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: event.ticketUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors",
                                children: "Get Tickets"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/EventCard.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/analytics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Google Analytics 4 custom event tracking
// Measurement ID is configured in index.html (G-2FFB2TG70S)
__turbopack_context__.s([
    "outboundClickProps",
    ()=>outboundClickProps,
    "trackFilterApplied",
    ()=>trackFilterApplied,
    "trackViewChange",
    ()=>trackViewChange
]);
function isLocalhost() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}
function trackEvent(eventName, params) {
    if (isLocalhost() || !window.gtag) return;
    window.gtag("event", eventName, params);
}
/** Track outbound link clicks (Info, Tickets, or Image links) */ function trackOutboundClick(venue, eventTitle, linkType, destinationUrl) {
    trackEvent("outbound_click", {
        venue,
        event_title: eventTitle,
        link_type: linkType,
        destination_url: destinationUrl
    });
}
function outboundClickProps(venue, eventTitle, linkType, destinationUrl) {
    const track = ()=>trackOutboundClick(venue, eventTitle, linkType, destinationUrl);
    return {
        onClick: track,
        onAuxClick: track
    };
}
function trackViewChange(view) {
    trackEvent("view_change", {
        tab_name: view
    });
}
function trackFilterApplied(filterType, value) {
    trackEvent("filter_applied", {
        filter_type: filterType,
        filter_value: value
    });
}
}),
"[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventCardCompact",
    ()=>EventCardCompact
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/EventCardCompact.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/analytics.ts [app-ssr] (ecmascript)");
;
;
;
;
// Image component with error fallback
function EventImage({ src, alt }) {
    const [hasError, setHasError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (hasError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full bg-gray-800 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-500 text-5xl",
                children: "♪"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: "",
                "aria-hidden": "true",
                loading: "lazy",
                decoding: "async",
                onError: ()=>setHasError(true),
                className: "absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: alt,
                loading: "lazy",
                decoding: "async",
                onError: ()=>setHasError(true),
                className: "relative w-full h-full object-contain"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
// Share button component
function ShareButton({ url, title }) {
    const handleShare = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    url
                });
            } catch  {
            // User cancelled or share failed - ignore
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: handleShare,
        className: "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/50 text-gray-400 hover:bg-black/70 hover:text-white",
        title: "Share",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 77,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
// Save button component
function SaveButton({ isSaved, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: (e)=>{
            e.preventDefault();
            e.stopPropagation();
            onClick();
        },
        className: `w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSaved ? "bg-green-500/90 text-white" : "bg-black/50 text-gray-400 hover:bg-black/70 hover:text-white"}`,
        title: isSaved ? "Remove from My Shows" : "Add to My Shows",
        children: isSaved ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M5 13l4 4L19 7"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 101,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
            lineNumber: 100,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M12 4v16m8-8H4"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 105,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
            lineNumber: 104,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
const EventCardCompact = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(function EventCardCompact({ event, venueColors, isJustAdded, isHighlighted, isSaved = false, onToggleSave, isExpired = false }) {
    const formatDateOverlay = (dateStr)=>{
        const date = new Date(dateStr + "T00:00:00");
        const weekday = date.toLocaleDateString("en-US", {
            weekday: "short"
        });
        const month = date.toLocaleDateString("en-US", {
            month: "short"
        });
        const day = date.getDate();
        return `${weekday} ${month} ${day}`;
    };
    const formatTime = (timeStr)=>{
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    const showPageUrl = `/show/${event.id}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: event.id,
        className: `py-6 transition-all duration-500 ${isHighlighted ? "bg-amber-500/10 -mx-4 px-4 rounded-xl" : ""} ${isExpired ? "opacity-60" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute top-2 right-2 z-10 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full font-medium shadow-lg",
                                children: "Expired"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 151,
                                columnNumber: 13
                            }, this),
                            isJustAdded && !isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute top-2 right-2 z-10 px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium shadow-lg",
                                children: "Recently Added"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 py-1.5 px-3 rounded-t-xl",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white font-semibold text-center text-sm",
                                    children: formatDateOverlay(event.date)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 161,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: showPageUrl,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "block w-full h-full",
                                        children: event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EventImage, {
                                            src: event.imageUrl,
                                            alt: event.title
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 168,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-full bg-gray-800 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-500 text-5xl",
                                                children: "♪"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                                lineNumber: 171,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 170,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 left-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShareButton, {
                                            url: `${window.location.origin}${showPageUrl}`,
                                            title: event.title
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 176,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this),
                                    onToggleSave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 right-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SaveButton, {
                                            isSaved: isSaved,
                                            onClick: ()=>onToggleSave(event.id)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 180,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 179,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 165,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            !isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: showPageUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-xl font-bold text-white hover:text-blue-400 transition-colors",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 189,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold text-white",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this),
                            event.supportingArtists && event.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 mt-1",
                                children: [
                                    "with ",
                                    event.supportingArtists.join(", ")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 mt-2",
                                children: [
                                    formatTime(event.time) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            formatTime(event.time),
                                            " · "
                                        ]
                                    }, void 0, true),
                                    event.venueUrl && !isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: event.venueUrl,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "hover:underline",
                                        style: {
                                            color: venueColors?.[event.source] || "#9ca3af"
                                        },
                                        children: event.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: venueColors?.[event.source] || "#9ca3af"
                                        },
                                        children: event.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 218,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this),
                            event.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: event.price
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 224,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex-1 text-center px-4 py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed",
                            children: "This show has passed"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                            lineNumber: 231,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: event.eventUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "info", event.eventUrl),
                                    className: "flex-1 text-center px-4 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors",
                                    children: "Info"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, this),
                                event.ticketUrl && event.ticketUrl !== event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: event.ticketUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "tickets", event.ticketUrl),
                                    className: "flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all",
                                    children: "Tickets"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 248,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:flex gap-5 relative",
                children: [
                    isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full font-medium shadow-lg",
                        children: "Expired"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, this),
                    isJustAdded && !isExpired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium shadow-lg",
                        children: "Recently Added"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 flex gap-3 mt-6",
                        children: isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-5 py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed",
                            children: "This show has passed"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                            lineNumber: 280,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: event.eventUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "info", event.eventUrl),
                                    className: "px-5 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors",
                                    children: "Info"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 286,
                                    columnNumber: 17
                                }, this),
                                event.ticketUrl && event.ticketUrl !== event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: event.ticketUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "tickets", event.ticketUrl),
                                    className: "px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all",
                                    children: "Tickets"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 297,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 278,
                        columnNumber: 9
                    }, this),
                    isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[220px] flex-shrink-0 overflow-hidden block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 py-1.5 px-3 rounded-t-xl",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white font-semibold text-center text-sm",
                                    children: formatDateOverlay(event.date)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 315,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square",
                                children: [
                                    event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EventImage, {
                                        src: event.imageUrl,
                                        alt: event.title
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-full bg-gray-800 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-500 text-5xl",
                                            children: "♪"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 324,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 323,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 left-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShareButton, {
                                            url: `${window.location.origin}${showPageUrl}`,
                                            title: event.title
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 328,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 327,
                                        columnNumber: 15
                                    }, this),
                                    onToggleSave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 right-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SaveButton, {
                                            isSaved: isSaved,
                                            onClick: ()=>onToggleSave(event.id)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 332,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 331,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 319,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 313,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: showPageUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "w-[220px] flex-shrink-0 overflow-hidden block hover:opacity-90 transition-opacity",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 py-1.5 px-3 rounded-t-xl",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white font-semibold text-center text-sm",
                                    children: formatDateOverlay(event.date)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                    lineNumber: 345,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 344,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square",
                                children: [
                                    event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EventImage, {
                                        src: event.imageUrl,
                                        alt: event.title
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 351,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-full bg-gray-800 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-500 text-5xl",
                                            children: "♪"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 354,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 353,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 left-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShareButton, {
                                            url: `${window.location.origin}${showPageUrl}`,
                                            title: event.title
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 358,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 357,
                                        columnNumber: 15
                                    }, this),
                                    onToggleSave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 right-2 z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SaveButton, {
                                            isSaved: isSaved,
                                            onClick: ()=>onToggleSave(event.id)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                            lineNumber: 362,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 361,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 349,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 338,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 pt-1 pr-52",
                        children: [
                            !isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: showPageUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-xl font-bold text-white hover:text-blue-400 transition-colors",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 372,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold text-white",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 381,
                                columnNumber: 13
                            }, this),
                            event.supportingArtists && event.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 mt-1",
                                children: [
                                    "with ",
                                    event.supportingArtists.join(", ")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 384,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 mt-3",
                                children: [
                                    formatTime(event.time) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            formatTime(event.time),
                                            " · "
                                        ]
                                    }, void 0, true),
                                    event.venueUrl && !isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: event.venueUrl,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "hover:underline",
                                        style: {
                                            color: venueColors?.[event.source] || "#9ca3af"
                                        },
                                        children: event.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 391,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: venueColors?.[event.source] || "#9ca3af"
                                        },
                                        children: event.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                        lineNumber: 401,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 388,
                                columnNumber: 11
                            }, this),
                            event.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: event.price
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                                lineNumber: 407,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                        lineNumber: 370,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
});
}),
"[project]/Dev/ShowCal/web/src/components/EventList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventList",
    ()=>EventList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/EventList.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/EventCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx [app-ssr] (ecmascript)");
;
;
;
;
const EVENTS_PER_PAGE = 15;
function EventList({ events, layout, filter, venueColors, isJustAdded, hasMore: hasMoreFromDb, loadingMore, onLoadMore, highlightedEventId, isSaved, onToggleSave, initialVisibleCount }) {
    const [visibleCount, setVisibleCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialVisibleCount || EVENTS_PER_PAGE);
    const loadMoreRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);
    // Reset visible count when filters change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setVisibleCount(EVENTS_PER_PAGE);
    }, [
        filter?.enabledVenues?.size,
        filter?.showPast,
        filter?.timeFilter,
        filter?.searchQuery
    ]);
    // Memoize filtered and sorted events
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let result = events;
        // Filter by enabled venues
        if (filter?.enabledVenues && filter.enabledVenues.size > 0) {
            result = result.filter((e)=>filter.enabledVenues.has(e.source));
        }
        // Filter by past/upcoming
        if (filter?.showPast === true) {
            result = result.filter((e)=>e.date < today);
        } else if (filter?.showPast === false) {
            result = result.filter((e)=>e.date >= today);
        }
        // Apply time filter
        if (filter?.timeFilter && filter.timeFilter !== "all") {
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            const weekDateStr = `${weekFromNow.getFullYear()}-${String(weekFromNow.getMonth() + 1).padStart(2, '0')}-${String(weekFromNow.getDate()).padStart(2, '0')}`;
            if (filter.timeFilter === "today") {
                result = result.filter((e)=>e.date === today);
            } else if (filter.timeFilter === "week") {
                result = result.filter((e)=>e.date >= today && e.date <= weekDateStr);
            } else if (filter.timeFilter === "just-added" && isJustAdded) {
                result = result.filter(isJustAdded);
            }
        }
        // Apply search filter
        if (filter?.searchQuery?.trim()) {
            const query = filter.searchQuery.toLowerCase();
            result = result.filter((e)=>e.title.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query) || e.supportingArtists?.some((a)=>a.toLowerCase().includes(query)));
        }
        // Sort by date
        if (filter?.showPast) {
            result = [
                ...result
            ].sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            result = [
                ...result
            ].sort((a, b)=>new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return result;
    }, [
        events,
        filter?.enabledVenues,
        filter?.showPast,
        filter?.timeFilter,
        filter?.searchQuery,
        today,
        isJustAdded
    ]);
    // Infinite scroll with IntersectionObserver
    const loadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const newCount = Math.min(visibleCount + EVENTS_PER_PAGE, filtered.length);
        setVisibleCount(newCount);
        // If we've shown all filtered events and there's more in database, load more
        if (newCount >= filtered.length && hasMoreFromDb && onLoadMore && !loadingMore) {
            onLoadMore();
        }
    }, [
        filtered.length,
        visibleCount,
        hasMoreFromDb,
        onLoadMore,
        loadingMore
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver((entries)=>{
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, {
            rootMargin: '200px'
        } // Load more before reaching the end
        );
        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return ()=>{
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [
        loadMore
    ]);
    // Only show events up to visibleCount
    const visibleEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>filtered.slice(0, visibleCount), [
        filtered,
        visibleCount
    ]);
    const hasMore = visibleCount < filtered.length || hasMoreFromDb;
    // Scroll to highlighted event - keep loading if not found yet
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!highlightedEventId) return;
        const eventInVisible = visibleEvents.some((e)=>e.id === highlightedEventId);
        if (eventInVisible) {
            // Event is visible, scroll to it
            setTimeout(()=>{
                const element = document.getElementById(highlightedEventId);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }, 200);
        } else if (hasMore && onLoadMore && !loadingMore) {
            // Event not found yet, load more
            loadMore();
        }
    }, [
        highlightedEventId,
        visibleEvents,
        hasMore,
        onLoadMore,
        loadingMore,
        loadMore
    ]);
    if (filtered.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400",
                    children: "No upcoming shows found."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                    lineNumber: 161,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-sm mt-2",
                    children: "Try adjusting your filters."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
            lineNumber: 160,
            columnNumber: 7
        }, this);
    }
    if (layout === "compact") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "divide-y divide-gray-700",
                    children: visibleEvents.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventCardCompact"], {
                            event: event,
                            venueColors: venueColors,
                            isJustAdded: isJustAdded?.(event),
                            isHighlighted: event.id === highlightedEventId,
                            isSaved: isSaved?.(event.id),
                            onToggleSave: onToggleSave
                        }, event.id, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                            lineNumber: 172,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                    lineNumber: 170,
                    columnNumber: 9
                }, this),
                (hasMore || loadingMore) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: loadMoreRef,
                    className: "h-20 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                        lineNumber: 186,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                    lineNumber: 185,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
            lineNumber: 169,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-gray-700",
                children: visibleEvents.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventCard"], {
                        event: event,
                        venueColors: venueColors
                    }, event.id, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                        lineNumber: 197,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            (hasMore || loadingMore) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: loadMoreRef,
                className: "h-20 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                    lineNumber: 203,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/EventList.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/components/HistoryList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HistoryList",
    ()=>HistoryList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/HistoryList.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
// Generate a stable ID for a historical show
function generateShowId(show) {
    const slug = show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const venueSlug = show.venue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${venueSlug}-${show.date}-${slug}`;
}
const SHOWS_PER_PAGE = 25;
// Map venue display names to source IDs
const venueNameToId = {
    "Slowdown": "theslowdown",
    "The Slowdown": "theslowdown",
    "Waiting Room": "waitingroom",
    "The Waiting Room": "waitingroom",
    "Reverb Lounge": "reverblounge",
    "Reverb": "reverblounge",
    "Bourbon Theatre": "bourbontheatre",
    "The Bourbon Theatre": "bourbontheatre",
    "Admiral": "admiral",
    "The Admiral": "admiral",
    "The Astro": "astrotheater",
    "Astro Theater": "astrotheater",
    "Astro": "astrotheater",
    "Steelhouse Omaha": "steelhouse",
    "Steelhouse": "steelhouse",
    "Holland Center": "holland",
    "Holland Performing Arts Center": "holland",
    "Orpheum Theater": "orpheum",
    "Orpheum": "orpheum",
    "Barnato": "barnato"
};
function HistoryList({ shows, enabledVenues, searchQuery, venueColors, venueUrls, timeFilter = "all", hasMore: hasMoreFromDb, loadingMore, onLoadMore, isSaved, onToggleSave }) {
    const [visibleCount, setVisibleCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(SHOWS_PER_PAGE);
    const [collapsedMonths, setCollapsedMonths] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [collapsedDays, setCollapsedDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const loadMoreRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Reset visible count when filters change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setVisibleCount(SHOWS_PER_PAGE);
    }, [
        enabledVenues.size,
        searchQuery,
        timeFilter
    ]);
    // Filter shows (time filtering done by database, only venue/search here)
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let result = shows;
        // Filter by venue
        if (enabledVenues.size > 0) {
            result = result.filter((show)=>{
                const venueId = venueNameToId[show.venue] || "other";
                return enabledVenues.has(venueId);
            });
        }
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((show)=>show.title.toLowerCase().includes(query) || show.venue.toLowerCase().includes(query));
        }
        return result;
    }, [
        shows,
        enabledVenues,
        searchQuery
    ]);
    // Infinite scroll with IntersectionObserver
    const loadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const newCount = Math.min(visibleCount + SHOWS_PER_PAGE, filtered.length);
        setVisibleCount(newCount);
        // If we've shown all filtered shows and there's more in database, load more
        if (newCount >= filtered.length && hasMoreFromDb && onLoadMore && !loadingMore) {
            onLoadMore();
        }
    }, [
        filtered.length,
        visibleCount,
        hasMoreFromDb,
        onLoadMore,
        loadingMore
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver((entries)=>{
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, {
            rootMargin: '200px'
        });
        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return ()=>{
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [
        loadMore
    ]);
    const visibleShows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>filtered.slice(0, visibleCount), [
        filtered,
        visibleCount
    ]);
    const hasMore = visibleCount < filtered.length || hasMoreFromDb;
    const getVenueId = (venueName)=>venueNameToId[venueName] || "other";
    const formatDayLabel = (dateStr)=>{
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
    };
    // Group shows by month, then by day within each month
    const groupedByMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const groups = {};
        visibleShows.forEach((show)=>{
            const date = new Date(show.date + "T00:00:00");
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(show);
        });
        return Object.entries(groups).sort(([a], [b])=>b.localeCompare(a)).map(([key, items])=>{
            // Sub-group by day
            const dayGroups = {};
            items.forEach((show)=>{
                if (!dayGroups[show.date]) dayGroups[show.date] = [];
                dayGroups[show.date].push(show);
            });
            const days = Object.entries(dayGroups).sort(([a], [b])=>b.localeCompare(a)).map(([dayKey, dayShows])=>({
                    key: dayKey,
                    label: formatDayLabel(dayKey),
                    shows: dayShows
                }));
            return {
                key,
                label: new Date(items[0].date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                }),
                shows: items,
                days
            };
        });
    }, [
        visibleShows
    ]);
    // Only expand current month by default
    const initialCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const collapsed = new Set();
        for (const group of groupedByMonth){
            if (group.key !== currentMonth) collapsed.add(group.key);
        }
        return collapsed;
    }, [
        groupedByMonth
    ]);
    // Reset collapsed state when filters change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setCollapsedMonths(initialCollapsed);
        setCollapsedDays(new Set());
    }, [
        initialCollapsed
    ]);
    const toggleMonth = (key)=>{
        setCollapsedMonths((prev)=>{
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };
    const toggleDay = (key)=>{
        setCollapsedDays((prev)=>{
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };
    if (filtered.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400",
                    children: "No shows found."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                    lineNumber: 217,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-sm mt-2",
                    children: "Try adjusting your filters."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                    lineNumber: 218,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
            lineNumber: 216,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            groupedByMonth.map((group)=>{
                const isCollapsed = collapsedMonths.has(group.key);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggleMonth(group.key),
                            className: "w-full flex items-center justify-between text-lg font-semibold text-gray-300 sticky top-0 bg-gray-900/90 py-2 -mx-6 px-6 cursor-pointer hover:text-white transition-colors",
                            style: {
                                width: "calc(100% + 3rem)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: group.label
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                    lineNumber: 235,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-gray-500 font-normal",
                                            children: [
                                                group.shows.length,
                                                " shows"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                            lineNumber: 237,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: `w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`,
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M19 9l-7 7-7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                lineNumber: 242,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                            lineNumber: 238,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                    lineNumber: 236,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                            lineNumber: 230,
                            columnNumber: 13
                        }, this),
                        !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "-mx-6",
                            children: group.days.map((day)=>{
                                const isDayCollapsed = collapsedDays.has(day.key);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>toggleDay(day.key),
                                            className: "w-full flex items-center justify-between py-1.5 px-6 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-gray-400 font-medium",
                                                    children: day.label
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-gray-600",
                                                            children: day.shows.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                            lineNumber: 258,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: `w-3 h-3 text-gray-600 transition-transform ${isDayCollapsed ? "" : "rotate-180"}`,
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M19 9l-7 7-7-7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                lineNumber: 263,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                            lineNumber: 259,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                    lineNumber: 257,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                            lineNumber: 252,
                                            columnNumber: 23
                                        }, this),
                                        !isDayCollapsed && day.shows.map((show, idx)=>{
                                            const venueId = getVenueId(show.venue);
                                            const venueHex = venueColors[venueId] || "#9ca3af";
                                            const venueUrl = venueUrls?.[venueId];
                                            const isLast = idx === day.shows.length - 1;
                                            const showId = generateShowId(show);
                                            const saved = isSaved?.(showId) ?? false;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `py-3 px-6 pl-10 ${!isLast ? "border-b border-gray-800/50" : ""}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-white flex-1 truncate",
                                                                children: show.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                lineNumber: 280,
                                                                columnNumber: 31
                                                            }, this),
                                                            venueUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: venueUrl,
                                                                target: "_blank",
                                                                rel: "noopener noreferrer",
                                                                className: "text-xs flex-shrink-0 hover:underline",
                                                                style: {
                                                                    color: venueHex
                                                                },
                                                                children: show.venue
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                lineNumber: 282,
                                                                columnNumber: 33
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs flex-shrink-0",
                                                                style: {
                                                                    color: venueHex
                                                                },
                                                                children: show.venue
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                lineNumber: 292,
                                                                columnNumber: 33
                                                            }, this),
                                                            onToggleSave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>onToggleSave(showId),
                                                                className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${saved ? "bg-green-500/90 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"}`,
                                                                title: saved ? "Remove from My Shows" : "Add to My Shows",
                                                                children: saved ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: "w-3 h-3",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    viewBox: "0 0 24 24",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        strokeWidth: 2,
                                                                        d: "M5 13l4 4L19 7"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                        lineNumber: 308,
                                                                        columnNumber: 39
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                    lineNumber: 307,
                                                                    columnNumber: 37
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: "w-3 h-3",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    viewBox: "0 0 24 24",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        strokeWidth: 2,
                                                                        d: "M12 4v16m8-8H4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                        lineNumber: 312,
                                                                        columnNumber: 39
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                    lineNumber: 311,
                                                                    columnNumber: 37
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                                lineNumber: 297,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 29
                                                    }, this),
                                                    show.supportingArtists && show.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-1 text-xs text-gray-500 truncate",
                                                        children: [
                                                            "with ",
                                                            show.supportingArtists.join(", ")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 31
                                                    }, this)
                                                ]
                                            }, `${show.date}-${show.title}-${idx}`, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                                lineNumber: 275,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    ]
                                }, day.key, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                                    lineNumber: 251,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                            lineNumber: 247,
                            columnNumber: 15
                        }, this)
                    ]
                }, group.key, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                    lineNumber: 229,
                    columnNumber: 11
                }, this);
            }),
            (hasMore || loadingMore) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: loadMoreRef,
                className: "h-20 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                    lineNumber: 338,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
                lineNumber: 337,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/HistoryList.tsx",
        lineNumber: 224,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FiltersDropdown",
    ()=>FiltersDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/FiltersDropdown.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/analytics.ts [app-ssr] (ecmascript)");
;
;
;
function FiltersDropdown(props) {
    const { venues, enabledVenues, toggleVenue, venueColors, timeFilter, setTimeFilter, isOpen: externalIsOpen, onOpenChange } = props;
    const mode = props.mode ?? "events";
    const [internalIsVisible, setInternalIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Use external control if provided, otherwise internal state
    const isVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsVisible;
    const setIsVisible = (value)=>{
        if (onOpenChange) {
            onOpenChange(value);
        } else {
            setInternalIsVisible(value);
        }
    };
    const openPanel = ()=>{
        setIsVisible(true);
        requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
                setIsAnimating(true);
            });
        });
    };
    const closePanel = ()=>{
        if (hasActiveFilters) {
            const disabledVenues = venues.filter((v)=>!enabledVenues.has(v.id)).map((v)=>v.name);
            if (timeFilter !== defaultTimeFilter) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackFilterApplied"])("time", timeFilter);
            }
            if (disabledVenues.length > 0) {
                const selected = venues.filter((v)=>enabledVenues.has(v.id)).map((v)=>v.name);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackFilterApplied"])("venue", selected.join(", "));
            }
        }
        setIsAnimating(false);
        setTimeout(()=>{
            setIsVisible(false);
        }, 150);
    };
    // Sync animation state when externally opened
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (externalIsOpen) {
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    setIsAnimating(true);
                });
            });
        }
    }, [
        externalIsOpen
    ]);
    // Prevent body scroll when panel is open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return ()=>{
            document.body.style.overflow = "";
        };
    }, [
        isVisible
    ]);
    // Default time filter depends on mode
    const defaultTimeFilter = mode === "history" ? "30days" : "all";
    const activeFiltersCount = (enabledVenues.size < venues.length ? 1 : 0) + (timeFilter !== defaultTimeFilter ? 1 : 0);
    const selectAllVenues = ()=>{
        venues.forEach((v)=>{
            if (!enabledVenues.has(v.id)) toggleVenue(v.id);
        });
    };
    const clearAllVenues = ()=>{
        venues.forEach((v)=>{
            if (enabledVenues.has(v.id)) toggleVenue(v.id);
        });
    };
    const clearAllFilters = ()=>{
        setTimeFilter(defaultTimeFilter);
        selectAllVenues();
    };
    const hasActiveFilters = timeFilter !== defaultTimeFilter || enabledVenues.size < venues.length;
    const eventsTimeOptions = [
        {
            id: "all",
            label: "All Upcoming"
        },
        {
            id: "today",
            label: "Today"
        },
        {
            id: "week",
            label: "Next 7 Days"
        },
        {
            id: "just-added",
            label: "Recently Added"
        }
    ];
    const historyTimeOptions = [
        {
            id: "30days",
            label: "Last 30 Days"
        },
        {
            id: "90days",
            label: "Last 90 Days"
        },
        {
            id: "this-year",
            label: "This Year"
        },
        {
            id: "year",
            label: "Last 12 Months"
        },
        {
            id: "all",
            label: "All History"
        }
    ];
    const timeOptions = mode === "history" ? historyTimeOptions : eventsTimeOptions;
    const timeLabel = mode === "history" ? "Time Period" : "Show";
    const FilterContent = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 md:p-6 border-b border-gray-700/50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3",
                            children: timeLabel
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                            lineNumber: 159,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: timeOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTimeFilter(option.id),
                                    className: `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] ${timeFilter === option.id ? "bg-purple-500/20 text-purple-400" : "text-gray-300 hover:bg-white/5"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: option.label
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 173,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                "count" in option && typeof option.count === "number" && option.count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full",
                                                    children: option.count
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 19
                                                }, this),
                                                timeFilter === option.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5 text-purple-400",
                                                    fill: "currentColor",
                                                    viewBox: "0 0 20 20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        fillRule: "evenodd",
                                                        d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                                        clipRule: "evenodd"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                        lineNumber: 182,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                    lineNumber: 181,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 174,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, option.id, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 164,
                                    columnNumber: 13
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                            lineNumber: 162,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                    lineNumber: 158,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 md:p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-xs font-semibold text-gray-500 uppercase tracking-wider",
                                    children: "Venues"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 194,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: selectAllVenues,
                                            className: "text-gray-400 hover:text-white transition-colors active:scale-95",
                                            children: "All"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 198,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-600",
                                            children: "·"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 201,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: clearAllVenues,
                                            className: "text-gray-400 hover:text-white transition-colors active:scale-95",
                                            children: "None"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 202,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 197,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                            lineNumber: 193,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: venues.map((v)=>{
                                const hexColor = venueColors[v.id] || "#9ca3af";
                                const isEnabled = enabledVenues.has(v.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>toggleVenue(v.id),
                                    className: `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 active:scale-[0.98] ${isEnabled ? "" : "opacity-40"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: isEnabled ? hexColor : "#6b7280"
                                            },
                                            children: v.name
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 219,
                                            columnNumber: 17
                                        }, this),
                                        isEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5 text-gray-500 flex-shrink-0",
                                            fill: "currentColor",
                                            viewBox: "0 0 20 20",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                lineNumber: 224,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 223,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, v.id, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 212,
                                    columnNumber: 15
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                            lineNumber: 207,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                    lineNumber: 192,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: openPanel,
                className: `flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${activeFiltersCount > 0 ? "bg-white/10 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4 flex-shrink-0",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden sm:inline",
                        children: "Filters"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    activeFiltersCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-xs rounded-full flex-shrink-0",
                        children: activeFiltersCount
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 251,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            isVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block fixed inset-0 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 bg-black/40 transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`,
                        onClick: closePanel
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 261,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute top-0 right-0 bottom-0 w-full max-w-sm bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-150 ease-out flex flex-col ${isAnimating ? "translate-x-0" : "translate-x-full"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-6 border-b border-gray-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-white",
                                        children: "Filters"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 276,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: closePanel,
                                        className: "p-2 text-gray-400 hover:text-white transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-6 h-6",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M6 18L18 6M6 6l12 12"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                lineNumber: 287,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 281,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 277,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 275,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterContent, {}, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 299,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 298,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 border-t border-gray-800 flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: clearAllFilters,
                                        disabled: !hasActiveFilters,
                                        className: `flex-1 py-3 font-medium rounded-xl transition-all active:scale-[0.98] ${hasActiveFilters ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-800/50 text-gray-600 cursor-not-allowed"}`,
                                        children: "Clear All"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 304,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: closePanel,
                                        className: "flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all",
                                        children: "Done"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 315,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 303,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                lineNumber: 259,
                columnNumber: 9
            }, this),
            isVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden fixed inset-0 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`,
                        onClick: closePanel
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 330,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-150 ease-out flex flex-col ${isAnimating ? "translate-y-0" : "translate-y-full"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sticky top-0 bg-gray-900 py-3 px-4 border-b border-gray-800 z-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-semibold text-white",
                                            children: "Filters"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 346,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: closePanel,
                                            className: "p-2 text-gray-400 hover:text-white active:scale-90 transition-transform",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M6 18L18 6M6 6l12 12"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                                lineNumber: 351,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                            lineNumber: 347,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                    lineNumber: 345,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 344,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterContent, {}, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 358,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sticky bottom-0 p-4 bg-gray-900 border-t border-gray-800 flex gap-3",
                                style: {
                                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: clearAllFilters,
                                        disabled: !hasActiveFilters,
                                        className: `flex-1 py-3 font-medium rounded-xl transition-all active:scale-[0.98] ${hasActiveFilters ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-800/50 text-gray-600 cursor-not-allowed"}`,
                                        children: "Clear All"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 365,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: closePanel,
                                        className: "flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all",
                                        children: "Done"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                        lineNumber: 376,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                                lineNumber: 361,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                        lineNumber: 338,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
                lineNumber: 328,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx",
        lineNumber: 236,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/components/ContactModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContactModal",
    ()=>ContactModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/ContactModal.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$formspree$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/@formspree/react/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
;
;
function ContactModal({ isOpen, onClose }) {
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [state, handleSubmit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$formspree$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useForm"])("mojnbwwj");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            document.body.style.overflow = "";
            const timer = setTimeout(()=>setIsVisible(false), 150);
            return ()=>clearTimeout(timer);
        }
    }, [
        isOpen
    ]);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            document.body.style.overflow = "";
        };
    }, []);
    // Auto-close after success
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (state.succeeded) {
            const timer = setTimeout(()=>{
                onClose();
            }, 2000);
            return ()=>clearTimeout(timer);
        }
    }, [
        state.succeeded,
        onClose
    ]);
    if (!isVisible) return null;
    const FormFields = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: "name",
                            className: "block text-sm text-gray-400 mb-1",
                            children: "Name"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 54,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            id: "name",
                            type: "text",
                            name: "name",
                            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500",
                            placeholder: "Your name"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 57,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                    lineNumber: 53,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: "email",
                            className: "block text-sm text-gray-400 mb-1",
                            children: "Email"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 67,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            id: "email",
                            type: "email",
                            name: "email",
                            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500",
                            placeholder: "your@email.com"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 70,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$formspree$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ValidationError"], {
                            prefix: "Email",
                            field: "email",
                            errors: state.errors,
                            className: "text-red-400 text-sm mt-1"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 77,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                    lineNumber: 66,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: "message",
                            className: "block text-sm text-gray-400 mb-1",
                            children: "Message"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 86,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            id: "message",
                            name: "message",
                            rows: 4,
                            className: "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none",
                            placeholder: "What's on your mind?"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 89,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$formspree$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ValidationError"], {
                            prefix: "Message",
                            field: "message",
                            errors: state.errors,
                            className: "text-red-400 text-sm mt-1"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                            lineNumber: 96,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                    lineNumber: 85,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
            lineNumber: 52,
            columnNumber: 5
        }, this);
    const SuccessMessage = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-green-400 text-4xl mb-3",
                    children: "✓"
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                    lineNumber: 108,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-white",
                    children: "Thanks! Message sent."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                    lineNumber: 109,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
            lineNumber: 107,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block fixed inset-0 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 bg-black/40 transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`,
                        onClick: onClose
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: `absolute top-0 left-0 bottom-0 w-full max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl transition-transform duration-150 ease-out flex flex-col ${isAnimating ? "translate-x-0" : "-translate-x-full"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-6 border-b border-gray-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-white",
                                        children: "Contact"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onClose,
                                        className: "p-2 text-gray-400 hover:text-white transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-6 h-6",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M6 18L18 6M6 6l12 12"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                                lineNumber: 146,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-6",
                                children: state.succeeded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SuccessMessage, {}, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormFields, {}, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 162,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: state.submitting,
                                                className: "w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                                children: state.submitting ? "Sending..." : "Send"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                                lineNumber: 164,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden fixed inset-0 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`,
                        onClick: onClose
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: `absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl transition-transform duration-150 ease-out flex flex-col max-h-[85vh] ${isAnimating ? "translate-y-0" : "translate-y-full"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 py-3 flex items-center justify-between border-b border-gray-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-white",
                                        children: "Contact"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                        lineNumber: 193,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onClose,
                                        className: "p-2 text-gray-400 hover:text-white active:scale-90 transition-transform",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M6 18L18 6M6 6l12 12"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                                lineNumber: 200,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 199,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                        lineNumber: 194,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-4",
                                children: state.succeeded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SuccessMessage, {}, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                    lineNumber: 207,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormFields, {}, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 210,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-3 mt-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: onClose,
                                                    className: "flex-1 py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all",
                                                    children: "Close"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                                    lineNumber: 212,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: state.submitting,
                                                    className: "flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                                    children: state.submitting ? "Sending..." : "Send"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/ContactModal.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DayEventsSheet",
    ()=>DayEventsSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/DayEventsSheet.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/analytics.ts [app-ssr] (ecmascript)");
;
;
;
function DayEventsSheet({ isOpen, onClose, date, events, venueColors, onPrevDay, onNextDay, hasPrevDay, hasNextDay }) {
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            setIsVisible(true);
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            const timeout = setTimeout(()=>{
                setIsVisible(false);
            }, 150);
            return ()=>clearTimeout(timeout);
        }
    }, [
        isOpen
    ]);
    // Prevent body scroll when sheet is open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return ()=>{
            document.body.style.overflow = "";
        };
    }, [
        isVisible
    ]);
    if (!isVisible) return null;
    const formatDate = (dateStr)=>{
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    };
    const formatTime = (timeStr)=>{
        if (!timeStr) return "TBA";
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`,
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-150 ease-out ${isAnimating ? "translate-y-0" : "translate-y-full"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky top-0 bg-gray-900 py-3 px-4 border-b border-gray-800 z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-10"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-white text-center",
                                    children: formatDate(date)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "p-2 text-gray-400 hover:text-white active:scale-90 transition-transform",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M6 18L18 6M6 6l12 12"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 112,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                        lineNumber: 111,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 text-center py-8",
                            children: "No events on this day"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                            lineNumber: 121,
                            columnNumber: 13
                        }, this) : events.map((event, idx)=>{
                            const venueHex = venueColors[event.source] || "#9ca3af";
                            const isLast = idx === events.length - 1;
                            const listingUrl = event.eventUrl || event.ticketUrl;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `py-4 px-6 ${!isLast ? "border-b border-gray-800" : ""}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                listingUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: listingUrl,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "info", listingUrl),
                                                    className: "text-white font-medium hover:text-blue-400 transition-colors",
                                                    children: event.title
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 25
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white font-medium",
                                                    children: event.title
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 148,
                                                    columnNumber: 25
                                                }, this),
                                                event.supportingArtists && event.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 text-sm mt-0.5 truncate",
                                                    children: [
                                                        "with ",
                                                        event.supportingArtists.join(", ")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-400 mt-1",
                                                    children: [
                                                        event.venueUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: event.venueUrl,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "hover:underline",
                                                            style: {
                                                                color: venueHex
                                                            },
                                                            children: event.venue
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: venueHex
                                                            },
                                                            children: event.venue
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                            lineNumber: 167,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-600",
                                                            children: " · "
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                            lineNumber: 169,
                                                            columnNumber: 25
                                                        }, this),
                                                        formatTime(event.time),
                                                        event.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-600",
                                                                    children: " · "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                                    lineNumber: 173,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-500",
                                                                    children: event.price
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                                    lineNumber: 174,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 136,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2 flex-shrink-0",
                                            children: [
                                                event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: event.eventUrl,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "info", event.eventUrl),
                                                    className: "px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition-colors",
                                                    children: "Info"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 25
                                                }, this),
                                                event.ticketUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: event.ticketUrl,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["outboundClickProps"])(event.venue, event.title, "tickets", event.ticketUrl),
                                                    className: "px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors",
                                                    children: "Tickets"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 181,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 135,
                                    columnNumber: 19
                                }, this)
                            }, event.id, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                lineNumber: 131,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky bottom-0 p-4 bg-gray-900 border-t border-gray-800",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onPrevDay,
                                    disabled: !hasPrevDay,
                                    className: `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${hasPrevDay ? "text-gray-300 hover:text-white hover:bg-gray-800 active:scale-95" : "text-gray-700 cursor-not-allowed"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M15 19l-7-7 7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                lineNumber: 225,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 224,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm",
                                            children: "Prev"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 215,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onNextDay,
                                    disabled: !hasNextDay,
                                    className: `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${hasNextDay ? "text-gray-300 hover:text-white hover:bg-gray-800 active:scale-95" : "text-gray-700 cursor-not-allowed"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm",
                                            children: "Next"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 239,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M9 5l7 7-7 7"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                                lineNumber: 241,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                            lineNumber: 240,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                                    lineNumber: 230,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                            lineNumber: 214,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/lib/cache.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Simple client-side cache with TTL support
// Used to reduce redundant API calls and improve perceived performance
__turbopack_context__.s([
    "eventCache",
    ()=>eventCache,
    "getCacheKey",
    ()=>getCacheKey,
    "historyCache",
    ()=>historyCache,
    "invalidateEventCaches",
    ()=>invalidateEventCaches,
    "sourcesCache",
    ()=>sourcesCache,
    "venueCache",
    ()=>venueCache,
    "withCache",
    ()=>withCache
]);
class QueryCache {
    cache = new Map();
    defaultTTL;
    constructor(defaultTTL = 60000){
        this.defaultTTL = defaultTTL;
    }
    /**
   * Get a cached value if it exists and hasn't expired
   */ get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
   * Set a value in the cache
   */ set(key, data, ttl) {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + (ttl ?? this.defaultTTL)
        });
    }
    /**
   * Check if a key exists and is valid
   */ has(key) {
        return this.get(key) !== null;
    }
    /**
   * Invalidate a specific key
   */ invalidate(key) {
        this.cache.delete(key);
    }
    /**
   * Invalidate all keys matching a prefix
   */ invalidatePrefix(prefix) {
        for (const key of this.cache.keys()){
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
    /**
   * Clear all cached data
   */ clear() {
        this.cache.clear();
    }
    /**
   * Get cache statistics
   */ stats() {
        // Clean up expired entries first
        for (const [key, entry] of this.cache.entries()){
            if (Date.now() > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
const eventCache = new QueryCache(60000); // 1 minute for events
const historyCache = new QueryCache(300000); // 5 minutes for history
const venueCache = new QueryCache(600000); // 10 minutes for venues (rarely change)
const sourcesCache = new QueryCache(60000); // 1 minute for sources
function getCacheKey(prefix, params) {
    if (!params) return prefix;
    const sortedParams = Object.keys(params).sort().map((k)=>`${k}=${JSON.stringify(params[k])}`).join('&');
    return `${prefix}:${sortedParams}`;
}
async function withCache(cache, key, fetcher, ttl) {
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
        return cached;
    }
    // Fetch and cache
    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
}
function invalidateEventCaches() {
    eventCache.clear();
    historyCache.clear();
    sourcesCache.clear();
}
}),
"[project]/Dev/ShowCal/web/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approveEvent",
    ()=>approveEvent,
    "createScraperRun",
    ()=>createScraperRun,
    "getEventById",
    ()=>getEventById,
    "getEvents",
    ()=>getEvents,
    "getEventsByIds",
    ()=>getEventsByIds,
    "getEventsForMonth",
    ()=>getEventsForMonth,
    "getFullEventsByIds",
    ()=>getFullEventsByIds,
    "getHistory",
    ()=>getHistory,
    "getLatestScraperRuns",
    ()=>getLatestScraperRuns,
    "getPendingEvents",
    ()=>getPendingEvents,
    "getScraperRuns",
    ()=>getScraperRuns,
    "getSession",
    ()=>getSession,
    "getSources",
    ()=>getSources,
    "getTotalEventCount",
    ()=>getTotalEventCount,
    "getVenues",
    ()=>getVenues,
    "rejectEvent",
    ()=>rejectEvent,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut,
    "submitEvent",
    ()=>submitEvent,
    "supabase",
    ()=>supabase,
    "updateScraperRun",
    ()=>updateScraperRun
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/cache.ts [app-ssr] (ecmascript)");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://blzynkplmyagxucehpns.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsenlua3BsbXlhZ3h1Y2VocG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzM3NTEsImV4cCI6MjA4ODA0OTc1MX0.Az4i0cPGdV2GseAB2koPZy-ka9Gi2SXa8v74gYvYNtQ");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
;
async function getVenues() {
    const cacheKey = 'venues:active';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withCache"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["venueCache"], cacheKey, async ()=>{
        const { data, error } = await supabase.from('venues').select('*').eq('active', true).order('name');
        if (error) throw error;
        return data || [];
    });
}
// Transform DB event to app Event type
function toAppEvent(dbEvent, venues) {
    const venue = venues.find((v)=>v.id === dbEvent.venue_id);
    // For "other" events, use venue_name field; otherwise use venue lookup
    const venueName = dbEvent.venue_id === 'other' ? dbEvent.venue_name || '' : venue?.name || dbEvent.venue_id;
    // For "other" events, use other_venue_website; otherwise use venue's website_url
    const venueUrl = dbEvent.venue_id === 'other' ? dbEvent.other_venue_website || undefined : venue?.website_url || undefined;
    return {
        id: dbEvent.id,
        title: dbEvent.title,
        date: dbEvent.date,
        time: dbEvent.time || undefined,
        venue: venueName,
        venueUrl,
        eventUrl: dbEvent.event_url || undefined,
        ticketUrl: dbEvent.ticket_url || undefined,
        imageUrl: dbEvent.image_url || undefined,
        price: dbEvent.price || undefined,
        ageRestriction: dbEvent.age_restriction || undefined,
        supportingArtists: dbEvent.supporting_artists || undefined,
        source: dbEvent.venue_id,
        addedAt: dbEvent.added_at,
        category: dbEvent.category
    };
}
// Transform DB event to HistoricalShow type
function toHistoricalShow(dbEvent, venues) {
    const venue = venues.find((v)=>v.id === dbEvent.venue_id);
    const venueName = dbEvent.venue_id === 'other' ? dbEvent.venue_name : venue?.name || dbEvent.venue_id;
    return {
        date: dbEvent.date,
        title: dbEvent.title,
        venue: venueName || '',
        supportingArtists: dbEvent.supporting_artists || undefined
    };
}
// Get local date string (not UTC) to prevent timezone issues
function getLocalDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
// Get recently added cutoff date
function getRecentlyAddedCutoff() {
    const LAUNCH_DATE = new Date('2026-03-03T00:00:00Z').getTime();
    const SEVEN_DAYS_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cutoff = Math.max(LAUNCH_DATE, SEVEN_DAYS_AGO);
    return new Date(cutoff).toISOString();
}
async function getEvents(options) {
    const today = getLocalDateString();
    const venues = await getVenues();
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const timeFilter = options?.timeFilter || 'all';
    const search = options?.search?.trim() || '';
    const venueIds = options?.venueIds;
    // Cache non-search, non-venue-filtered queries
    const cacheKey = search || venueIds ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCacheKey"])('events', {
        today,
        limit,
        offset,
        timeFilter
    });
    if (cacheKey) {
        const cached = __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["eventCache"].get(cacheKey);
        if (cached) return cached;
    }
    let query = supabase.from('events').select('*', {
        count: 'exact'
    }).gte('date', today).eq('status', 'approved');
    // Apply time filter
    if (timeFilter === 'today') {
        query = query.eq('date', today);
    } else if (timeFilter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekDateStr = `${weekFromNow.getFullYear()}-${String(weekFromNow.getMonth() + 1).padStart(2, '0')}-${String(weekFromNow.getDate()).padStart(2, '0')}`;
        query = query.lte('date', weekDateStr);
    } else if (timeFilter === 'just-added') {
        const cutoff = getRecentlyAddedCutoff();
        query = query.gt('added_at', cutoff);
    }
    // Filter by venue IDs if provided
    if (venueIds && venueIds.length > 0) {
        query = query.in('venue_id', venueIds);
    }
    // Sort by added_at for recently added, otherwise by date
    if (timeFilter === 'just-added') {
        query = query.order('added_at', {
            ascending: false
        });
    } else {
        query = query.order('date', {
            ascending: true
        });
    }
    // Add search filter if provided - search both title and venue_name
    if (search) {
        // Check if search matches a known venue name
        const matchingVenue = venues.find((v)=>v.name.toLowerCase().includes(search.toLowerCase()));
        if (matchingVenue) {
            // Search by title OR venue_id OR venue_name (for "other" venues)
            query = query.or(`title.ilike.%${search}%,venue_id.eq.${matchingVenue.id},venue_name.ilike.%${search}%,supporting_artists_text.ilike.%${search}%`);
        } else {
            query = query.or(`title.ilike.%${search}%,venue_name.ilike.%${search}%,supporting_artists_text.ilike.%${search}%`);
        }
    }
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const events = (data || []).map((e)=>toAppEvent(e, venues));
    const totalCount = count || 0;
    const hasMore = totalCount > offset + events.length;
    const result = {
        events,
        hasMore,
        totalCount
    };
    // Cache the result if this was a cacheable query
    if (cacheKey) {
        __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["eventCache"].set(cacheKey, result);
    }
    return result;
}
async function getTotalEventCount() {
    const today = getLocalDateString();
    const { count, error } = await supabase.from('events').select('*', {
        count: 'exact',
        head: true
    }).gte('date', today).eq('status', 'approved');
    if (error) throw error;
    return count || 0;
}
async function getHistory(options) {
    const today = new Date();
    const todayStr = getLocalDateString();
    const filter = options?.filter || '30days';
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    // Check cache first (history is cached for 5 minutes)
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCacheKey"])('history', {
        todayStr,
        filter,
        limit,
        offset
    });
    const cached = __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["historyCache"].get(cacheKey);
    if (cached) return cached;
    const venues = await getVenues();
    // Calculate date range based on filter
    let startDate = null;
    if (filter === '30days') {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
    } else if (filter === '90days') {
        const d = new Date(today);
        d.setDate(d.getDate() - 90);
        startDate = d.toISOString().split('T')[0];
    } else if (filter === 'year') {
        const d = new Date(today);
        d.setFullYear(d.getFullYear() - 1);
        startDate = d.toISOString().split('T')[0];
    }
    // 'all' = no startDate filter
    let query = supabase.from('events').select('*', {
        count: 'exact'
    }).lt('date', todayStr).eq('status', 'approved').order('date', {
        ascending: false
    });
    // Apply date filter if not "all"
    if (startDate) {
        query = query.gte('date', startDate);
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const shows = (data || []).map((e)=>toHistoricalShow(e, venues));
    const hasMore = count ? offset + shows.length < count : false;
    const result = {
        shows,
        hasMore
    };
    // Cache the result
    __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["historyCache"].set(cacheKey, result);
    return result;
}
async function getSources() {
    const today = getLocalDateString();
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCacheKey"])('sources', {
        today
    });
    const cached = __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sourcesCache"].get(cacheKey);
    if (cached) return cached;
    // Fetch venues and event counts in parallel
    const [venues, countsResult] = await Promise.all([
        getVenues(),
        supabase.from('events').select('venue_id').gte('date', today).eq('status', 'approved')
    ]);
    const countMap = {};
    for (const row of countsResult.data || []){
        countMap[row.venue_id] = (countMap[row.venue_id] || 0) + 1;
    }
    const result = venues.map((v)=>({
            id: v.id,
            name: v.name,
            url: v.website_url || '',
            status: 'ok',
            lastScraped: new Date().toISOString(),
            eventCount: countMap[v.id] || 0,
            colorHex: v.color_hex || '#6b7280'
        }));
    __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sourcesCache"].set(cacheKey, result);
    return result;
}
async function getPendingEvents() {
    const { data, error } = await supabase.from('events').select('*').eq('status', 'pending').order('created_at', {
        ascending: false
    });
    if (error) throw error;
    return data;
}
// Send approval notification email via Edge Function
async function sendApprovalEmail(event) {
    // Get current session to ensure we have auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('No active session - cannot send email');
        return;
    }
    // Call the Edge Function
    // Pass anon key in Authorization header (gateway accepts HS256)
    // Pass user's access token in body (function verifies ES256 inside)
    const functionUrl = `${supabaseUrl}/functions/v1/send-approval-email`;
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
            title: event.title,
            date: event.date,
            venue: event.venue_id,
            submitterEmail: event.submitter_email,
            accessToken: session.access_token
        })
    });
    if (!response.ok) {
        const error = await response.text();
        console.error('Failed to send email:', error);
    }
}
async function approveEvent(id) {
    // First get the event details for the email
    const { data: event } = await supabase.from('events').select('title, date, venue_id, submitter_email').eq('id', id).single();
    // Update status
    const { error } = await supabase.from('events').update({
        status: 'approved'
    }).eq('id', id);
    if (error) throw error;
    // Invalidate caches since event list changed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["invalidateEventCaches"])();
    // Send notification email if submitter provided email
    if (event?.submitter_email) {
        try {
            await sendApprovalEmail(event);
        } catch (err) {
            console.error('Failed to send approval email:', err);
        // Don't throw - event was approved, email is secondary
        }
    }
}
async function rejectEvent(id) {
    const { error } = await supabase.from('events').update({
        status: 'rejected'
    }).eq('id', id);
    if (error) throw error;
    // Invalidate caches since event list changed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["invalidateEventCaches"])();
}
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
async function getScraperRuns(scraperId, limit = 10) {
    let query = supabase.from('scraper_runs').select('*').order('started_at', {
        ascending: false
    }).limit(limit);
    if (scraperId) {
        query = query.eq('scraper_id', scraperId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}
async function getLatestScraperRuns() {
    const { data, error } = await supabase.from('scraper_runs').select('*').order('started_at', {
        ascending: false
    });
    if (error) throw error;
    const latest = {};
    for (const run of data || []){
        if (!latest[run.scraper_id]) {
            latest[run.scraper_id] = run;
        }
    }
    return latest;
}
async function createScraperRun(scraperId, scraperName) {
    const { data, error } = await supabase.from('scraper_runs').insert({
        scraper_id: scraperId,
        scraper_name: scraperName,
        status: 'running',
        event_count: 0
    }).select().single();
    if (error) throw error;
    return data;
}
async function updateScraperRun(runId, status, eventCount, errorMessage) {
    const { error } = await supabase.from('scraper_runs').update({
        status,
        event_count: eventCount,
        error_message: errorMessage || null,
        finished_at: new Date().toISOString()
    }).eq('id', runId);
    if (error) throw error;
}
async function getEventsByIds(ids) {
    if (!ids.length) return [];
    const { data, error } = await supabase.from('events').select('id, title, date').in('id', ids).order('date', {
        ascending: true
    });
    if (error) throw error;
    return data || [];
}
async function getFullEventsByIds(ids) {
    if (!ids.length) return [];
    const venues = await getVenues();
    const { data, error } = await supabase.from('events').select('*').in('id', ids).order('date', {
        ascending: true
    });
    if (error) throw error;
    return (data || []).map((e)=>toAppEvent(e, venues));
}
async function getEventsForMonth(year, month) {
    const venues = await getVenues();
    // Build date range for the month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`;
    const { data, error } = await supabase.from('events').select('id, title, date, time, venue_id, venue_name, other_venue_website, event_url, ticket_url, price, supporting_artists').gte('date', startDate).lt('date', endDate).eq('status', 'approved').order('date', {
        ascending: true
    });
    if (error) throw error;
    return (data || []).map((e)=>{
        const venue = venues.find((v)=>v.id === e.venue_id);
        const venueName = e.venue_id === 'other' ? e.venue_name || '' : venue?.name || e.venue_id;
        const venueUrl = e.venue_id === 'other' ? e.other_venue_website || undefined : venue?.website_url || undefined;
        return {
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time || undefined,
            venue: venueName,
            venueUrl,
            source: e.venue_id,
            eventUrl: e.event_url || undefined,
            ticketUrl: e.ticket_url || undefined,
            price: e.price || undefined,
            supportingArtists: e.supporting_artists || undefined
        };
    });
}
async function getEventById(id) {
    const venues = await getVenues();
    const { data, error } = await supabase.from('events').select('*').eq('id', id).eq('status', 'approved').single();
    if (error || !data) return null;
    return toAppEvent(data, venues);
}
async function submitEvent(data) {
    // Generate ID: manual-YYYY-MM-DD-slug
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const id = `manual-${data.date}-${slug}`;
    const { error } = await supabase.from('events').insert({
        id,
        title: data.title,
        date: data.date,
        time: data.time || null,
        venue_id: data.venueId,
        venue_name: data.venueName || null,
        other_venue_website: data.otherVenueWebsite || null,
        other_venue_address: data.otherVenueAddress || null,
        event_url: data.eventUrl || null,
        ticket_url: data.ticketUrl || null,
        image_url: data.imageUrl || null,
        price: data.price || null,
        age_restriction: data.ageRestriction || null,
        supporting_artists: data.supportingArtists?.length ? data.supportingArtists : null,
        submitter_email: data.submitterEmail || null,
        source: 'manual',
        status: 'pending'
    });
    if (error) throw error;
}
}),
"[project]/Dev/ShowCal/web/src/components/CalendarView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarView",
    ()=>CalendarView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// web/src/components/CalendarView.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$DayEventsSheet$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/DayEventsSheet.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>");
;
;
;
;
function CalendarView({ venueColors, enabledVenues }) {
    const [currentMonth, setCurrentMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Date());
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [calendarEvents, setCalendarEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Desktop panel animation state
    const [isPanelVisible, setIsPanelVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPanelAnimating, setIsPanelAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Fetch events when month changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        setIsLoading(true);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEventsForMonth"])(year, month).then(setCalendarEvents).catch(console.error).finally(()=>setIsLoading(false));
    }, [
        currentMonth
    ]);
    // Handle panel open/close animation on desktop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedDate) {
            setIsPanelVisible(true);
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    setIsPanelAnimating(true);
                });
            });
        } else {
            setIsPanelAnimating(false);
            const timeout = setTimeout(()=>{
                setIsPanelVisible(false);
            }, 150);
            return ()=>clearTimeout(timeout);
        }
    }, [
        selectedDate
    ]);
    // Filter events by enabled venues
    const filteredEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>calendarEvents.filter((e)=>enabledVenues.has(e.source)), [
        calendarEvents,
        enabledVenues
    ]);
    // Group events by date
    const eventsByDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        for (const event of filteredEvents){
            const existing = map.get(event.date) || [];
            existing.push(event);
            map.set(event.date, existing);
        }
        return map;
    }, [
        filteredEvents
    ]);
    const getEventsForDate = (dateStr)=>{
        return eventsByDate.get(dateStr) || [];
    };
    // Calendar calculations
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
    const navigateMonth = (direction)=>{
        setCurrentMonth((prev)=>{
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };
    const formatDateStr = (day)=>{
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
    };
    const formatSelectedDate = (dateStr)=>{
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    };
    const formatTime = (timeStr)=>{
        if (!timeStr) return "TBA";
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };
    const today = new Date();
    const todayStr = today.getFullYear() === year && today.getMonth() === month ? String(today.getDate()) : null;
    const dayNames = [
        "S",
        "M",
        "T",
        "W",
        "T",
        "F",
        "S"
    ];
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
    // Get sorted list of dates with events for navigation
    const datesWithEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return Array.from(eventsByDate.keys()).sort();
    }, [
        eventsByDate
    ]);
    const currentDateIndex = selectedDate ? datesWithEvents.indexOf(selectedDate) : -1;
    const hasPrevDay = currentDateIndex > 0;
    const hasNextDay = currentDateIndex >= 0 && currentDateIndex < datesWithEvents.length - 1;
    const goToPrevDay = ()=>{
        if (hasPrevDay) {
            setSelectedDate(datesWithEvents[currentDateIndex - 1]);
        }
    };
    const goToNextDay = ()=>{
        if (hasNextDay) {
            setSelectedDate(datesWithEvents[currentDateIndex + 1]);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "md:max-w-xl md:mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-4 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>navigateMonth(-1),
                        className: "p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors active:scale-95",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M15 19l-7-7 7-7"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 167,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-white flex items-center gap-2",
                        children: [
                            monthName,
                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 animate-spin text-gray-500",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        className: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        strokeWidth: "4"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                        lineNumber: 179,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        className: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                        lineNumber: 180,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>navigateMonth(1),
                        className: "p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors active:scale-95",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M9 5l7 7-7 7"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                            lineNumber: 188,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-1",
                children: [
                    dayNames.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center text-xs text-gray-500 py-2 font-medium",
                            children: d
                        }, i, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                            lineNumber: 208,
                            columnNumber: 11
                        }, this)),
                    Array(42).fill(null).map((_, i)=>{
                        const dayNumber = i - firstDayOfMonth + 1;
                        const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
                        if (!isValidDay) {
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "aspect-square"
                            }, `cell-${i}`, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 224,
                                columnNumber: 22
                            }, this);
                        }
                        const dateStr = formatDateStr(dayNumber);
                        const dayEvents = getEventsForDate(dateStr);
                        const eventCount = dayEvents.length;
                        const hasEvents = eventCount > 0;
                        const isToday = todayStr === String(dayNumber);
                        const isSelected = selectedDate === dateStr;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>hasEvents && setSelectedDate(dateStr),
                            disabled: !hasEvents,
                            className: `
                  aspect-square flex flex-col items-center justify-center rounded-lg transition-all
                  ${hasEvents ? "cursor-pointer" : "cursor-default"}
                  ${hasEvents ? "bg-gray-800 hover:bg-gray-700 active:scale-95" : "hover:bg-gray-800/30"}
                  ${isSelected ? "ring-2 ring-white" : ""}
                  ${isToday ? "ring-1 ring-purple-500" : ""}
                `,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-sm ${hasEvents ? "text-white font-medium" : "text-gray-500"} ${isToday ? "text-purple-400" : ""}`,
                                    children: dayNumber
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                    lineNumber: 251,
                                    columnNumber: 17
                                }, this),
                                hasEvents && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-gray-400 leading-none mt-0.5",
                                    children: [
                                        "(",
                                        eventCount,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                    lineNumber: 259,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, `cell-${i}`, true, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                            lineNumber: 235,
                            columnNumber: 15
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            isPanelVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block fixed inset-0 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute inset-0 bg-black/40 transition-opacity duration-150 ${isPanelAnimating ? "opacity-100" : "opacity-0"}`,
                        onClick: ()=>setSelectedDate(null)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute top-0 right-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-150 ease-out ${isPanelAnimating ? "translate-x-0" : "translate-x-full"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-6 border-b border-gray-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: goToPrevDay,
                                                disabled: !hasPrevDay,
                                                className: `p-2 rounded-lg transition-colors flex-shrink-0 ${hasPrevDay ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-700 cursor-not-allowed"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    viewBox: "0 0 24 24",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: 2,
                                                        d: "M15 19l-7-7 7-7"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                        lineNumber: 298,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                lineNumber: 288,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold text-white text-center w-56",
                                                children: selectedDate && formatSelectedDate(selectedDate)
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                lineNumber: 301,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: goToNextDay,
                                                disabled: !hasNextDay,
                                                className: `p-2 rounded-lg transition-colors flex-shrink-0 ${hasNextDay ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-700 cursor-not-allowed"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    viewBox: "0 0 24 24",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: 2,
                                                        d: "M9 5l7 7-7 7"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                        lineNumber: 314,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                lineNumber: 304,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedDate(null),
                                        className: "p-2 text-gray-400 hover:text-white transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-6 h-6",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M6 18L18 6M6 6l12 12"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                lineNumber: 328,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                            lineNumber: 322,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                        lineNumber: 318,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 286,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-y-auto h-[calc(100%-80px)]",
                                children: selectedEvents.map((event, idx)=>{
                                    const venueHex = venueColors[event.source] || "#9ca3af";
                                    const isLast = idx === selectedEvents.length - 1;
                                    const listingUrl = event.eventUrl || event.ticketUrl;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `py-4 px-6 ${!isLast ? "border-b border-gray-800" : ""}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        listingUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: listingUrl,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "text-white font-medium hover:text-blue-400 transition-colors",
                                                            children: event.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 353,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white font-medium",
                                                            children: event.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 27
                                                        }, this),
                                                        event.supportingArtists && event.supportingArtists.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-gray-500 text-sm mt-0.5 truncate",
                                                            children: [
                                                                "with ",
                                                                event.supportingArtists.join(", ")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-gray-400 mt-1",
                                                            children: [
                                                                event.venueUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: event.venueUrl,
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    className: "hover:underline",
                                                                    style: {
                                                                        color: venueHex
                                                                    },
                                                                    children: event.venue
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                                    lineNumber: 374,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: venueHex
                                                                    },
                                                                    children: event.venue
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                                    lineNumber: 384,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-600",
                                                                    children: " · "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                                    lineNumber: 386,
                                                                    columnNumber: 27
                                                                }, this),
                                                                formatTime(event.time),
                                                                event.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-gray-600",
                                                                            children: " · "
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                                            lineNumber: 390,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-gray-500",
                                                                            children: event.price
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                                            lineNumber: 391,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 372,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2 flex-shrink-0",
                                                    children: [
                                                        event.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: event.eventUrl,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition-colors",
                                                            children: "Info"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 27
                                                        }, this),
                                                        event.ticketUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: event.ticketUrl,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors",
                                                            children: "Tickets"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                            lineNumber: 410,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                            lineNumber: 350,
                                            columnNumber: 21
                                        }, this)
                                    }, event.id, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                        lineNumber: 346,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                                lineNumber: 339,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                lineNumber: 270,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$DayEventsSheet$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DayEventsSheet"], {
                    isOpen: selectedDate !== null,
                    onClose: ()=>setSelectedDate(null),
                    date: selectedDate || "",
                    events: selectedEvents,
                    venueColors: venueColors,
                    onPrevDay: goToPrevDay,
                    onNextDay: goToNextDay,
                    hasPrevDay: hasPrevDay,
                    hasNextDay: hasNextDay
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                    lineNumber: 431,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
                lineNumber: 430,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/src/components/CalendarView.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/components/SeoStructuredData.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SeoStructuredData",
    ()=>SeoStructuredData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const VENUE_INFO = {
    theslowdown: {
        name: "Slowdown",
        streetAddress: "729 N 14th St",
        city: "Omaha",
        state: "NE",
        postalCode: "68102"
    },
    waitingroom: {
        name: "Waiting Room Lounge",
        streetAddress: "6212 Maple St",
        city: "Omaha",
        state: "NE",
        postalCode: "68104"
    },
    reverblounge: {
        name: "Reverb Lounge",
        streetAddress: "6121 Military Ave",
        city: "Omaha",
        state: "NE",
        postalCode: "68104"
    },
    admiral: {
        name: "Admiral",
        streetAddress: "1501 Jackson St",
        city: "Omaha",
        state: "NE",
        postalCode: "68102"
    },
    bourbontheatre: {
        name: "Bourbon Theatre",
        streetAddress: "1415 O St",
        city: "Lincoln",
        state: "NE",
        postalCode: "68508"
    },
    astrotheater: {
        name: "The Astro",
        streetAddress: "2105 Farnam St",
        city: "Omaha",
        state: "NE",
        postalCode: "68102"
    },
    steelhouse: {
        name: "Steelhouse Omaha",
        streetAddress: "1228 S 6th St",
        city: "Omaha",
        state: "NE",
        postalCode: "68108"
    },
    holland: {
        name: "Holland Center",
        streetAddress: "1200 Douglas St",
        city: "Omaha",
        state: "NE",
        postalCode: "68102"
    },
    orpheum: {
        name: "Orpheum Theater",
        streetAddress: "409 S 16th St",
        city: "Omaha",
        state: "NE",
        postalCode: "68102"
    },
    barnato: {
        name: "Barnato",
        streetAddress: "7023 Farnam St",
        city: "Omaha",
        state: "NE",
        postalCode: "68132"
    }
};
function buildEventSchema(event) {
    const venue = VENUE_INFO[event.source];
    const startDate = event.time ? `${event.date}T${event.time}:00` : event.date;
    const schema = {
        "@type": "MusicEvent",
        name: event.title,
        startDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode"
    };
    if (venue) {
        schema.location = {
            "@type": "Place",
            name: venue.name,
            address: {
                "@type": "PostalAddress",
                streetAddress: venue.streetAddress,
                addressLocality: venue.city,
                addressRegion: venue.state,
                postalCode: venue.postalCode,
                addressCountry: "US"
            }
        };
    } else {
        schema.location = {
            "@type": "Place",
            name: event.venue
        };
    }
    if (event.imageUrl) {
        schema.image = event.imageUrl.startsWith("http") ? event.imageUrl : `https://omahashows.com${event.imageUrl}`;
    }
    if (event.eventUrl) {
        schema.url = event.eventUrl;
    }
    if (event.ticketUrl || event.price) {
        const offer = {
            "@type": "Offer",
            url: event.ticketUrl || event.eventUrl || "https://omahashows.com/",
            availability: "https://schema.org/InStock"
        };
        if (event.price) {
            if (event.price.toLowerCase() === "free") {
                offer.price = "0";
                offer.priceCurrency = "USD";
            } else {
                const match = event.price.match(/\$(\d+(?:\.\d{2})?)/);
                if (match) {
                    offer.price = match[1];
                    offer.priceCurrency = "USD";
                }
            }
        }
        schema.offers = offer;
    }
    if (event.supportingArtists && event.supportingArtists.length > 0) {
        schema.performer = [
            {
                "@type": "MusicGroup",
                name: event.title
            },
            ...event.supportingArtists.map((artist)=>({
                    "@type": "MusicGroup",
                    name: artist
                }))
        ];
    } else {
        schema.performer = {
            "@type": "MusicGroup",
            name: event.title
        };
    }
    return schema;
}
function SeoStructuredData({ events }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Upcoming Shows in Omaha",
            numberOfItems: events.length,
            itemListElement: events.map((event, index)=>({
                    "@type": "ListItem",
                    position: index + 1,
                    item: buildEventSchema(event)
                }))
        };
        const id = "seo-events-jsonld";
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement("script");
            script.id = id;
            script.type = "application/ld+json";
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(jsonLd);
        return ()=>{
            const el = document.getElementById(id);
            if (el) el.remove();
        };
    }, [
        events
    ]);
    return null;
}
}),
"[project]/Dev/ShowCal/web/src/lib/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Venue colors type - hex string per venue
__turbopack_context__.s([
    "DEFAULT_VENUE_COLORS",
    ()=>DEFAULT_VENUE_COLORS,
    "VENUE_COLORS",
    ()=>VENUE_COLORS,
    "hexToRgba",
    ()=>hexToRgba
]);
const DEFAULT_VENUE_COLORS = {
    theslowdown: "#f59e0b",
    waitingroom: "#f97316",
    reverblounge: "#f43f5e",
    bourbontheatre: "#ec4899",
    admiral: "#d946ef",
    astrotheater: "#a855f7",
    steelhouse: "#06b6d4",
    baxterarena: "#ef4444",
    stircove: "#eab308",
    other: "#10b981",
    holland: "#14b8a6",
    orpheum: "#6366f1",
    barnato: "#84cc16"
};
const VENUE_COLORS = DEFAULT_VENUE_COLORS;
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
}),
"[project]/Dev/ShowCal/web/src/components/Toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
function Toast({ message, type, onClose, duration = 4000 }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setTimeout(()=>{
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);
        return ()=>clearTimeout(timer);
    }, [
        duration,
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 z-50 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3",
            children: [
                type === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M5 13l4 4L19 7"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                        lineNumber: 35,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                    lineNumber: 34,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                        lineNumber: 39,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                    lineNumber: 38,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "ml-2 hover:opacity-70",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M6 18L18 6M6 6l12 12"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                            lineNumber: 45,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Dev/ShowCal/web/src/components/Toast.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SubmitShowForm",
    ()=>SubmitShowForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$Toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/Toast.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
const VENUES = [
    {
        id: "theslowdown",
        name: "The Slowdown",
        url: "https://theslowdown.com"
    },
    {
        id: "waitingroom",
        name: "Waiting Room Lounge",
        url: "https://waitingroomlounge.com"
    },
    {
        id: "reverblounge",
        name: "Reverb Lounge",
        url: "https://reverblounge.com/"
    },
    {
        id: "bourbontheatre",
        name: "Bourbon Theatre",
        url: "https://bourbontheatre.com"
    },
    {
        id: "admiral",
        name: "Admiral",
        url: "https://admiralomaha.com"
    },
    {
        id: "astrotheater",
        name: "The Astro",
        url: "https://theastrotheater.com/"
    },
    {
        id: "steelhouse",
        name: "Steelhouse Omaha",
        url: "https://steelhouseomaha.com"
    },
    {
        id: "holland",
        name: "Holland Center",
        url: "https://o-pa.org/visit-our-venues/holland/"
    },
    {
        id: "orpheum",
        name: "Orpheum Theater",
        url: "https://o-pa.org/visit-our-venues/orpheum/"
    },
    {
        id: "barnato",
        name: "Barnato",
        url: "https://barnatoomaha.com"
    },
    {
        id: "other",
        name: "Other Venue"
    }
];
function isValidEmail(email) {
    if (!email) return true; // Optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidUrl(url) {
    if (!url) return true;
    // Accept anything that looks like a URL (has a dot and no spaces)
    return url.includes('.') && !url.includes(' ');
}
function normalizeUrl(url) {
    if (!url) return url;
    url = url.trim();
    // If no protocol, add https://
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}
function isValidDate(dateStr) {
    if (!dateStr) return {
        valid: false,
        error: "Date is required"
    };
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
        return {
            valid: false,
            error: "Date cannot be in the past"
        };
    }
    return {
        valid: true
    };
}
function SubmitShowForm() {
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [customTime, setCustomTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("19:00");
    const [selectedHour, setSelectedHour] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(7);
    const [selectedMinute, setSelectedMinute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("00");
    const [isPM, setIsPM] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [venueId, setVenueId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [customVenue, setCustomVenue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [otherVenueWebsite, setOtherVenueWebsite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [otherVenueAddress, setOtherVenueAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [eventUrl, setEventUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ticketUrl, setTicketUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [imageUrl, setImageUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [price, setPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ageRestriction, setAgeRestriction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [supportingArtists, setSupportingArtists] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [submitterEmail, setSubmitterEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitStatus, setSubmitStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recentSubmissions, setRecentSubmissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [touched, setTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [imageMode, setImageMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("upload");
    const [uploadedImage, setUploadedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragActive, setDragActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const minuteInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedVenue = VENUES.find((v)=>v.id === venueId);
    const venueName = venueId === "other" ? customVenue : selectedVenue?.name || "";
    const effectiveTime = time || customTime;
    const effectiveImageUrl = imageMode === "upload" ? uploadedImage : imageUrl;
    // Validation
    const errors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const errs = {};
        if (touched.title && !title.trim()) {
            errs.title = "Artist/event name is required";
        } else if (title.trim().length > 200) {
            errs.title = "Title must be under 200 characters";
        }
        if (touched.date) {
            const dateValidation = isValidDate(date);
            if (!dateValidation.valid) {
                errs.date = dateValidation.error;
            }
        }
        if (touched.venue && !venueId) {
            errs.venue = "Please select a venue";
        }
        if (touched.customVenue && venueId === "other" && !customVenue.trim()) {
            errs.customVenue = "Custom venue name is required";
        }
        if (touched.eventUrl && eventUrl && !isValidUrl(eventUrl)) {
            errs.eventUrl = "Please enter a valid URL";
        }
        if (touched.ticketUrl && ticketUrl && !isValidUrl(ticketUrl)) {
            errs.ticketUrl = "Please enter a valid URL";
        }
        if (touched.imageUrl && imageMode === "url" && imageUrl && !isValidUrl(imageUrl)) {
            errs.imageUrl = "Please enter a valid URL";
        }
        if (touched.email && submitterEmail && !isValidEmail(submitterEmail)) {
            errs.email = "Please enter a valid email address";
        }
        return errs;
    }, [
        title,
        date,
        venueId,
        customVenue,
        eventUrl,
        ticketUrl,
        imageUrl,
        imageMode,
        submitterEmail,
        touched
    ]);
    const hasErrors = Object.keys(errors).length > 0;
    const generateId = ()=>{
        if (!title || !date || !venueId) return "";
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
        return `manual-${date}-${slug}`;
    };
    const eventPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!title || !date || !venueId) return null;
        // Get venue URL - for "other" venues use the entered website, otherwise use static list
        const venueUrl = venueId === "other" ? otherVenueWebsite && isValidUrl(otherVenueWebsite) ? normalizeUrl(otherVenueWebsite) : undefined : selectedVenue?.url;
        const event = {
            id: generateId(),
            title: title.trim(),
            date,
            venue: venueName,
            venueUrl,
            source: venueId === "other" ? "other" : venueId
        };
        if (effectiveTime) event.time = effectiveTime;
        if (eventUrl) event.eventUrl = eventUrl;
        if (ticketUrl) event.ticketUrl = ticketUrl;
        if (effectiveImageUrl) event.imageUrl = effectiveImageUrl;
        if (price) event.price = price;
        if (ageRestriction) event.ageRestriction = ageRestriction;
        if (supportingArtists.trim()) {
            event.supportingArtists = supportingArtists.split(",").map((s)=>s.trim()).filter(Boolean);
        }
        return event;
    }, [
        title,
        date,
        effectiveTime,
        venueId,
        venueName,
        selectedVenue,
        otherVenueWebsite,
        eventUrl,
        ticketUrl,
        effectiveImageUrl,
        price,
        ageRestriction,
        supportingArtists
    ]);
    // Image upload handler
    const handleImageUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (file)=>{
        if (!file.type.startsWith("image/")) {
            setSubmitStatus({
                type: "error",
                message: "Please upload an image file"
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setSubmitStatus({
                type: "error",
                message: "Image must be under 5MB"
            });
            return;
        }
        setUploading(true);
        setSubmitStatus(null);
        try {
            const ext = file.name.split(".").pop() || "jpg";
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const path = `event-images/${filename}`;
            const { error: uploadError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].storage.from("uploads").upload(path, file, {
                cacheControl: "3600",
                upsert: false
            });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].storage.from("uploads").getPublicUrl(path);
            setUploadedImage(publicUrl);
            setImageMode("upload");
        } catch (err) {
            console.error("Upload failed:", err);
            setSubmitStatus({
                type: "error",
                message: err instanceof Error ? err.message : "Failed to upload image"
            });
        } finally{
            setUploading(false);
        }
    }, []);
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    }, [
        handleImageUpload
    ]);
    const handleDragOver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        setDragActive(true);
    }, []);
    const handleDragLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        setDragActive(false);
    }, []);
    const handleFileSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    }, [
        handleImageUpload
    ]);
    const handleSubmit = async ()=>{
        // Touch all fields to show validation
        setTouched({
            title: true,
            date: true,
            venue: true,
            customVenue: true,
            eventUrl: true,
            ticketUrl: true,
            imageUrl: true
        });
        if (!eventPreview || hasErrors) return;
        // Final validation
        const dateCheck = isValidDate(date);
        if (!dateCheck.valid) {
            setSubmitStatus({
                type: "error",
                message: dateCheck.error || "Invalid date"
            });
            return;
        }
        setSubmitting(true);
        setSubmitStatus(null);
        try {
            const data = {
                title: title.trim(),
                date,
                venueId: venueId === "other" ? "other" : venueId
            };
            if (effectiveTime) data.time = effectiveTime;
            if (venueId === "other" && customVenue.trim()) {
                data.venueName = customVenue.trim();
                if (otherVenueWebsite && isValidUrl(otherVenueWebsite)) {
                    data.otherVenueWebsite = normalizeUrl(otherVenueWebsite);
                }
                if (otherVenueAddress.trim()) {
                    data.otherVenueAddress = otherVenueAddress.trim();
                }
            }
            if (eventUrl && isValidUrl(eventUrl)) data.eventUrl = normalizeUrl(eventUrl);
            if (ticketUrl && isValidUrl(ticketUrl)) data.ticketUrl = normalizeUrl(ticketUrl);
            if (effectiveImageUrl) data.imageUrl = normalizeUrl(effectiveImageUrl);
            if (price) data.price = price;
            if (ageRestriction) data.ageRestriction = ageRestriction;
            if (supportingArtists.trim()) {
                data.supportingArtists = supportingArtists.split(",").map((s)=>s.trim()).filter(Boolean);
            }
            if (submitterEmail && isValidEmail(submitterEmail)) {
                data.submitterEmail = submitterEmail;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["submitEvent"])(data);
            // Notify admin of new submission
            try {
                await fetch(`${("TURBOPACK compile-time value", "https://blzynkplmyagxucehpns.supabase.co")}/functions/v1/notify-admin-pending`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsenlua3BsbXlhZ3h1Y2VocG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzM3NTEsImV4cCI6MjA4ODA0OTc1MX0.Az4i0cPGdV2GseAB2koPZy-ka9Gi2SXa8v74gYvYNtQ")}`
                    },
                    body: JSON.stringify({
                        type: "user_submission",
                        submission: {
                            title: title.trim(),
                            date,
                            venue: venueName,
                            submitterEmail: submitterEmail || undefined
                        }
                    })
                });
            } catch (notifyError) {
                // Don't fail the submission if notification fails
                console.error("Failed to send admin notification:", notifyError);
            }
            setRecentSubmissions((prev)=>[
                    title,
                    ...prev.slice(0, 4)
                ]);
            setSubmitStatus({
                type: "success",
                message: `"${title}" submitted for review`
            });
            // Reset form
            setTitle("");
            setDate("");
            setTime("");
            setCustomTime("19:00");
            setSelectedHour(7);
            setSelectedMinute("00");
            setIsPM(true);
            setVenueId("");
            setCustomVenue("");
            setOtherVenueWebsite("");
            setOtherVenueAddress("");
            setEventUrl("");
            setTicketUrl("");
            setImageUrl("");
            setUploadedImage(null);
            setPrice("");
            setAgeRestriction("");
            setSupportingArtists("");
            setSubmitterEmail("");
            setTouched({});
        } catch (err) {
            console.error("Failed to submit:", err);
            setSubmitStatus({
                type: "error",
                message: err instanceof Error ? err.message : "Failed to submit event"
            });
        } finally{
            setSubmitting(false);
        }
    };
    // Convert hour/minute/AM-PM to 24-hour format
    const updateTimeFromSelectors = (hour, minute, pm)=>{
        let h24 = hour;
        if (pm && hour !== 12) h24 = hour + 12;
        if (!pm && hour === 12) h24 = 0;
        const timeStr = `${h24.toString().padStart(2, "0")}:${minute}`;
        setTime("");
        setCustomTime(timeStr);
    };
    const handleAmPmToggle = (pm)=>{
        setIsPM(pm);
        if (selectedHour !== null) {
            updateTimeFromSelectors(selectedHour, selectedMinute, pm);
        }
    };
    const handleBlur = (field)=>{
        setTouched((prev)=>({
                ...prev,
                [field]: true
            }));
    };
    const isValid = title && date && venueId && (venueId !== "other" || customVenue) && !hasErrors;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 394,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 395,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 393,
                                columnNumber: 11
                            }, this),
                            "Preview"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this),
                    eventPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-gray-800 rounded-xl overflow-hidden bg-[#0c0c0e] p-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventCardCompact"], {
                            event: eventPreview,
                            venueColors: __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VENUE_COLORS"]
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                            lineNumber: 402,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 401,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-900/30 border border-gray-800/50 border-dashed rounded-xl p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-12 h-12 mx-auto text-gray-700 mb-3",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 1.5,
                                    d: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                    lineNumber: 410,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 text-sm",
                                children: "Fill out the form to see a preview"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 412,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 408,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                lineNumber: 391,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-sm font-semibold text-gray-400 uppercase tracking-wider pb-4 mb-5 border-b border-gray-800 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                            lineNumber: 420,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 419,
                        columnNumber: 9
                    }, this),
                    "Show Details"
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                lineNumber: 418,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-2 gap-x-8 gap-y-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                        children: [
                                            "Artist / Event Name ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-rose-400",
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 432,
                                                columnNumber: 35
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 431,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: title,
                                        onChange: (e)=>setTitle(e.target.value),
                                        onBlur: ()=>handleBlur("title"),
                                        placeholder: "Event or artist name",
                                        className: `w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"}`
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 434,
                                        columnNumber: 13
                                    }, this),
                                    errors.title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-red-400 text-xs mt-1",
                                        children: errors.title
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 447,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 430,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                        children: [
                                            "Venue ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-rose-400",
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 454,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 453,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: venueId,
                                        onChange: (e)=>setVenueId(e.target.value),
                                        onBlur: ()=>handleBlur("venue"),
                                        className: `w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none transition-all appearance-none cursor-pointer ${errors.venue ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"}`,
                                        style: {
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 12px center',
                                            backgroundSize: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Select venue..."
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 467,
                                                columnNumber: 15
                                            }, this),
                                            VENUES.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: v.id,
                                                    children: v.name
                                                }, v.id, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                    lineNumber: 469,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 456,
                                        columnNumber: 13
                                    }, this),
                                    errors.venue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-red-400 text-xs mt-1",
                                        children: errors.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 473,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 452,
                                columnNumber: 11
                            }, this),
                            venueId === "other" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                                children: [
                                                    "Custom Venue Name ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-rose-400",
                                                        children: "*"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 482,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 481,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: customVenue,
                                                onChange: (e)=>setCustomVenue(e.target.value),
                                                onBlur: ()=>handleBlur("customVenue"),
                                                placeholder: "Venue name",
                                                className: `w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all ${errors.customVenue ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"}`
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 484,
                                                columnNumber: 17
                                            }, this),
                                            errors.customVenue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-red-400 text-xs mt-1",
                                                children: errors.customVenue
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 497,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 480,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                                children: "Venue Website"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 501,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "url",
                                                value: otherVenueWebsite,
                                                onChange: (e)=>setOtherVenueWebsite(e.target.value),
                                                placeholder: "e.g. venuename.com",
                                                className: "w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 504,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 500,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                                children: "Venue Address"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 513,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: otherVenueAddress,
                                                onChange: (e)=>setOtherVenueAddress(e.target.value),
                                                placeholder: "e.g. 123 Main St, Omaha, NE",
                                                className: "w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 516,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 512,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                        children: [
                                            "Date ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-rose-400",
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 530,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 529,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: date,
                                        onChange: (e)=>setDate(e.target.value),
                                        onBlur: ()=>handleBlur("date"),
                                        min: new Date().toISOString().split("T")[0],
                                        className: `w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none transition-all [color-scheme:dark] ${errors.date ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"}`
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 532,
                                        columnNumber: 13
                                    }, this),
                                    errors.date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-red-400 text-xs mt-1",
                                        children: errors.date
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 545,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 528,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                        children: "Time"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 551,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                inputMode: "numeric",
                                                maxLength: 2,
                                                value: selectedHour?.toString() ?? "",
                                                onFocus: (e)=>e.target.select(),
                                                onChange: (e)=>{
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    if (val === '') {
                                                        setSelectedHour(null);
                                                        setTime("");
                                                        setCustomTime("");
                                                        return;
                                                    }
                                                    const num = parseInt(val);
                                                    if (num >= 0 && num <= 12) {
                                                        setSelectedHour(num);
                                                        if (num > 0) updateTimeFromSelectors(num, selectedMinute, isPM);
                                                        // Auto-advance to minutes when hour is complete:
                                                        // - Two digits entered (10, 11, 12), or
                                                        // - Single digit 2-9 (can't form valid 2-digit hour)
                                                        if (val.length === 2 || val.length === 1 && num >= 2) {
                                                            setTimeout(()=>{
                                                                minuteInputRef.current?.focus();
                                                                minuteInputRef.current?.select();
                                                            }, 0);
                                                        }
                                                    }
                                                },
                                                onBlur: (e)=>{
                                                    const val = e.target.value;
                                                    if (val === '') return; // Allow empty
                                                    let num = parseInt(val) || 1;
                                                    if (num < 1) num = 1;
                                                    if (num > 12) num = 12;
                                                    setSelectedHour(num);
                                                    updateTimeFromSelectors(num, selectedMinute, isPM);
                                                },
                                                className: "w-14 px-2 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-lg font-medium focus:outline-none focus:border-amber-500/50 transition-all",
                                                placeholder: "7"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 556,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-500 text-2xl font-light",
                                                children: ":"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 597,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: minuteInputRef,
                                                type: "text",
                                                inputMode: "numeric",
                                                maxLength: 2,
                                                value: selectedMinute,
                                                onFocus: (e)=>e.target.select(),
                                                onChange: (e)=>{
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                                    setSelectedMinute(val);
                                                    if (selectedHour) updateTimeFromSelectors(selectedHour, val.padStart(2, '0'), isPM);
                                                },
                                                onBlur: (e)=>{
                                                    let num = parseInt(e.target.value) || 0;
                                                    if (num > 59) num = 59;
                                                    const padded = num.toString().padStart(2, '0');
                                                    setSelectedMinute(padded);
                                                    if (selectedHour) updateTimeFromSelectors(selectedHour, padded, isPM);
                                                },
                                                className: "w-14 px-2 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-lg font-medium focus:outline-none focus:border-amber-500/50 transition-all",
                                                placeholder: "00"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 599,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>handleAmPmToggle(!isPM),
                                                className: "ml-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all min-w-[52px]",
                                                children: isPM ? "PM" : "AM"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 622,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 554,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 550,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 427,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between mb-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                children: "Event Image"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 638,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1 p-0.5 bg-gray-800 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setImageMode("upload"),
                                                        className: `px-2 py-1 text-xs rounded transition-all ${imageMode === "upload" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`,
                                                        children: "Upload"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 642,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setImageMode("url"),
                                                        className: `px-2 py-1 text-xs rounded transition-all ${imageMode === "url" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`,
                                                        children: "URL"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 653,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 641,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 637,
                                        columnNumber: 13
                                    }, this),
                                    imageMode === "upload" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onDrop: handleDrop,
                                        onDragOver: handleDragOver,
                                        onDragLeave: handleDragLeave,
                                        onClick: ()=>fileInputRef.current?.click(),
                                        className: `relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive ? "border-amber-500 bg-amber-500/10" : uploadedImage ? "border-green-500/50 bg-green-500/5" : "border-gray-700 hover:border-gray-600 bg-gray-900/50"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: fileInputRef,
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handleFileSelect,
                                                className: "hidden"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 681,
                                                columnNumber: 17
                                            }, this),
                                            uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 690,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 text-sm",
                                                        children: "Uploading..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 691,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 689,
                                                columnNumber: 19
                                            }, this) : uploadedImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: uploadedImage,
                                                        alt: "Uploaded preview",
                                                        className: "w-20 h-20 object-cover rounded-lg"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 695,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-green-400 text-sm",
                                                        children: "Image uploaded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 700,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            setUploadedImage(null);
                                                        },
                                                        className: "text-xs text-gray-500 hover:text-red-400 transition-colors",
                                                        children: "Remove"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 701,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 694,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-10 h-10 text-gray-600",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 1.5,
                                                            d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                            lineNumber: 715,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 714,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 text-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-amber-400",
                                                                children: "Click to upload"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                                lineNumber: 718,
                                                                columnNumber: 23
                                                            }, this),
                                                            " or drag and drop"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 717,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-600 text-xs",
                                                        children: "PNG, JPG up to 5MB"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                        lineNumber: 720,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 713,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 668,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "url",
                                                value: imageUrl,
                                                onChange: (e)=>setImageUrl(e.target.value),
                                                onBlur: ()=>handleBlur("imageUrl"),
                                                placeholder: "https://example.com/image.jpg",
                                                className: `w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${errors.imageUrl ? "border-red-500 focus:border-red-500" : "border-gray-800 focus:border-gray-600"}`
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 726,
                                                columnNumber: 17
                                            }, this),
                                            errors.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-red-400 text-xs mt-1",
                                                children: errors.imageUrl
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 739,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 725,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 636,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                                children: "Event URL"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 748,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "url",
                                                value: eventUrl,
                                                onChange: (e)=>setEventUrl(e.target.value),
                                                onBlur: ()=>handleBlur("eventUrl"),
                                                placeholder: "https://...",
                                                className: `w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${errors.eventUrl ? "border-red-500 focus:border-red-500" : "border-gray-800 focus:border-gray-600"}`
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 751,
                                                columnNumber: 17
                                            }, this),
                                            errors.eventUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-red-400 text-xs mt-1",
                                                children: errors.eventUrl
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 764,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 747,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                                children: "Ticket URL"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 768,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "url",
                                                value: ticketUrl,
                                                onChange: (e)=>setTicketUrl(e.target.value),
                                                onBlur: ()=>handleBlur("ticketUrl"),
                                                placeholder: "https://...",
                                                className: `w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${errors.ticketUrl ? "border-red-500 focus:border-red-500" : "border-gray-800 focus:border-gray-600"}`
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 771,
                                                columnNumber: 17
                                            }, this),
                                            errors.ticketUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-red-400 text-xs mt-1",
                                                children: errors.ticketUrl
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 784,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 767,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 746,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: price,
                                                onChange: (e)=>setPrice(e.target.value),
                                                placeholder: "Price (e.g. $25, Free)",
                                                className: "w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 792,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: ageRestriction,
                                                onChange: (e)=>setAgeRestriction(e.target.value),
                                                placeholder: "Age (e.g. 21+, All Ages)",
                                                className: "w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 799,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 791,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: supportingArtists,
                                        onChange: (e)=>setSupportingArtists(e.target.value),
                                        placeholder: "Supporting artists (comma-separated)",
                                        className: "w-full mt-3 px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 807,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 790,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5",
                                        children: "Email (Optional - get notified when approved)"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 818,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        value: submitterEmail,
                                        onChange: (e)=>setSubmitterEmail(e.target.value),
                                        onBlur: ()=>handleBlur("email"),
                                        placeholder: "your@email.com - we'll notify you when approved",
                                        className: `w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-800 focus:border-gray-600"}`
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 821,
                                        columnNumber: 13
                                    }, this),
                                    errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-red-400 text-xs mt-1",
                                        children: errors.email
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 834,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 817,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleSubmit,
                                        disabled: !isValid || submitting,
                                        className: `w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${isValid && !submitting ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-500/20" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`,
                                        children: submitting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                    lineNumber: 851,
                                                    columnNumber: 19
                                                }, this),
                                                "Submitting..."
                                            ]
                                        }, void 0, true) : "Submit Show"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 840,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-600 text-center mt-2",
                                        children: "Shows go to pending status and require admin approval"
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 858,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 839,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 634,
                        columnNumber: 9
                    }, this),
                    recentSubmissions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                            lineNumber: 869,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 868,
                                        columnNumber: 15
                                    }, this),
                                    "Just Submitted"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 867,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: recentSubmissions.map((title, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4 text-green-500",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M5 13l4 4L19 7"
                                                }, void 0, false, {
                                                    fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                    lineNumber: 877,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 876,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-400",
                                                children: title
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                                lineNumber: 879,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                        lineNumber: 875,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                                lineNumber: 873,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                        lineNumber: 866,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            submitStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$Toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toast"], {
                message: submitStatus.message,
                type: submitStatus.type,
                onClose: ()=>setSubmitStatus(null)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx",
                lineNumber: 888,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Dev/ShowCal/web/src/hooks/useDebounce.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebounce",
    ()=>useDebounce
]);
// web/src/hooks/useDebounce.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = setTimeout(()=>{
            setDebouncedValue(value);
        }, delay);
        return ()=>{
            clearTimeout(handler);
        };
    }, [
        value,
        delay
    ]);
    return debouncedValue;
}
}),
"[project]/Dev/ShowCal/web/src/hooks/useSavedShows.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSavedShows",
    ()=>useSavedShows
]);
// web/src/hooks/useSavedShows.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const STORAGE_KEY = "savedShows";
function useSavedShows() {
    const [savedIds, setSavedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch  {
            return [];
        }
    });
    // Sync across tabs via storage event
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleStorage = (e)=>{
            if (e.key === STORAGE_KEY) {
                try {
                    setSavedIds(e.newValue ? JSON.parse(e.newValue) : []);
                } catch  {
                    setSavedIds([]);
                }
            }
        };
        window.addEventListener("storage", handleStorage);
        return ()=>window.removeEventListener("storage", handleStorage);
    }, []);
    // Persist to localStorage whenever savedIds changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
        } catch  {
        // localStorage full or disabled - silently fail
        }
    }, [
        savedIds
    ]);
    const isSaved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>savedIds.includes(id), [
        savedIds
    ]);
    const toggleSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setSavedIds((prev)=>{
            if (prev.includes(id)) {
                return prev.filter((x)=>x !== id);
            }
            return [
                ...prev,
                id
            ];
        });
    }, []);
    const removeSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setSavedIds((prev)=>prev.filter((x)=>x !== id));
    }, []);
    return {
        savedIds,
        isSaved,
        toggleSave,
        removeSave
    };
}
}),
"[project]/Dev/ShowCal/web/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/EventList.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/EventCardCompact.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$HistoryList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/HistoryList.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$FiltersDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/FiltersDropdown.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$ContactModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/ContactModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$CalendarView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/CalendarView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$SeoStructuredData$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/SeoStructuredData.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$SubmitShowForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/components/SubmitShowForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$hooks$2f$useDebounce$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/hooks/useDebounce.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$hooks$2f$useSavedShows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/hooks/useSavedShows.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/analytics.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/ShowCal/web/src/lib/constants.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Build a set of recently added event IDs (within last 7 days, after launch date)
const getRecentlyAddedIds = (events)=>{
    // Launch date - don't show "New" for events seeded before this date
    const LAUNCH_DATE = new Date('2026-03-03T00:00:00Z').getTime();
    const SEVEN_DAYS_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cutoff = Math.max(LAUNCH_DATE, SEVEN_DAYS_AGO);
    const recentIds = events.filter((e)=>e.addedAt && new Date(e.addedAt).getTime() > cutoff).map((e)=>e.id);
    return new Set(recentIds);
};
const EVENTS_PER_PAGE = 20;
// My Shows list component
function MyShowsList({ savedIds, venueColors, onToggleSave }) {
    const [savedEvents, setSavedEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Get today's date string for comparison
    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);
    // Fetch saved events directly from database when savedIds change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (savedIds.length === 0) {
            setSavedEvents([]);
            setLoading(false);
            return;
        }
        const fetchSavedEvents = async ()=>{
            setLoading(true);
            try {
                const events = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getFullEventsByIds"])(savedIds);
                setSavedEvents(events);
            } catch (err) {
                console.error("Failed to fetch saved events:", err);
                setSavedEvents([]);
            } finally{
                setLoading(false);
            }
        };
        fetchSavedEvents();
    }, [
        savedIds
    ]);
    // Check if an event is expired
    const isExpired = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>event.date < today, [
        today
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, this);
    }
    if (savedEvents.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400",
                    children: "No saved shows."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 text-sm mt-2",
                    children: "Click the + button on any event to add it here."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
            lineNumber: 96,
            columnNumber: 7
        }, this);
    }
    // Split into upcoming and past shows
    const upcomingShows = savedEvents.filter((e)=>!isExpired(e));
    const pastShows = savedEvents.filter((e)=>isExpired(e));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400 text-sm",
                    children: "Saved shows are stored in your browser. They won't appear on other devices and will be cleared if you clear your browser data."
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            upcomingShows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-gray-700",
                children: upcomingShows.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventCardCompact$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventCardCompact"], {
                        event: event,
                        venueColors: venueColors,
                        isSaved: true,
                        onToggleSave: onToggleSave
                    }, event.id, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 121,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this),
            pastShows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: upcomingShows.length > 0 ? "mt-6" : "",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-gray-500 font-medium mb-2",
                        children: "Past Shows"
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divide-y divide-gray-800/50",
                        children: pastShows.map((event)=>{
                            const venueHex = venueColors[event.source] || "#9ca3af";
                            const formatDate = (dateStr)=>{
                                const date = new Date(dateStr + "T00:00:00");
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                });
                            };
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "py-2 flex items-center gap-3 opacity-60",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-500 w-14 flex-shrink-0",
                                        children: formatDate(event.date)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white flex-1 truncate",
                                        children: event.title
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs flex-shrink-0",
                                        style: {
                                            color: venueHex
                                        },
                                        children: event.venue
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                        lineNumber: 147,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onToggleSave(event.id),
                                        className: "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/90 text-white",
                                        title: "Remove from My Shows",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-3 h-3",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M5 13l4 4L19 7"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                lineNumber: 154,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 153,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, event.id, true, {
                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                lineNumber: 144,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
function HomePage() {
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hasMoreEvents, setHasMoreEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [filteredTotalCount, setFilteredTotalCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loadingMore, setLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [historyShows, setHistoryShows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hasMoreHistory, setHasMoreHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loadingMoreHistory, setLoadingMoreHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sources, setSources] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("events");
    const [layout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("compact");
    const [enabledVenues, setEnabledVenues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [timeFilter, setTimeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [historyTimeFilter, setHistoryTimeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("30days");
    const [historySearch, setHistorySearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [eventSearch, setEventSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [showContact, setShowContact] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filtersOpen, setFiltersOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dataLoaded, setDataLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [historyLoaded, setHistoryLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingHistory, setLoadingHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [totalEventCount, setTotalEventCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const debouncedEventSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$hooks$2f$useDebounce$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebounce"])(eventSearch, 300);
    const { savedIds, isSaved, toggleSave } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$hooks$2f$useSavedShows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSavedShows"])();
    const [showSaveToast, setShowSaveToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Wrap toggleSave to show toast when adding
    const handleToggleSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        const wasAlreadySaved = isSaved(id);
        toggleSave(id);
        if (!wasAlreadySaved) {
            setShowSaveToast(true);
        }
    }, [
        isSaved,
        toggleSave
    ]);
    // Auto-hide toast after 3 seconds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (showSaveToast) {
            const timer = setTimeout(()=>setShowSaveToast(false), 3000);
            return ()=>clearTimeout(timer);
        }
    }, [
        showSaveToast
    ]);
    // Read URL query params on mount for view parameter
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam && [
            'events',
            'history',
            'calendar',
            'submit',
            'myshows'
        ].includes(viewParam)) {
            setView(viewParam);
            // Clear the query param from URL
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);
    // Read URL hash on mount and on hash change - prefill search
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleHash = async ()=>{
            const hash = window.location.hash.slice(1) // Remove the #
            ;
            if (hash) {
                setView("events"); // Switch to events view
                // Fetch the specific event and search for it directly
                const event = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEventById"])(hash);
                if (event) {
                    setEventSearch(event.title);
                    // Search directly, don't wait for debounce
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEvents"])({
                        limit: EVENTS_PER_PAGE,
                        offset: 0,
                        search: event.title
                    });
                    setEvents(result.events);
                    setHasMoreEvents(result.hasMore);
                    setFilteredTotalCount(result.totalCount);
                }
                // Clear the hash from URL
                window.history.replaceState(null, "", window.location.pathname);
            }
        };
        handleHash();
        window.addEventListener("hashchange", handleHash);
        return ()=>window.removeEventListener("hashchange", handleHash);
    }, []);
    const debouncedHistorySearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$hooks$2f$useDebounce$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebounce"])(historySearch, 300);
    const fetchData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const [eventsResult, sourcesData, totalCount] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEvents"])({
                    limit: EVENTS_PER_PAGE,
                    offset: 0
                }),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSources"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTotalEventCount"])()
            ]);
            setEvents(eventsResult.events);
            setHasMoreEvents(eventsResult.hasMore);
            setFilteredTotalCount(eventsResult.totalCount);
            setSources(sourcesData);
            setEnabledVenues(new Set(sourcesData.map((s)=>s.id)));
            setTotalEventCount(totalCount);
            setDataLoaded(true);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load events");
        }
    }, []);
    // Convert enabledVenues Set to array for API calls
    const enabledVenueIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Array.from(enabledVenues), [
        enabledVenues
    ]);
    const loadMoreEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (loadingMore || !hasMoreEvents) return;
        setLoadingMore(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEvents"])({
                limit: EVENTS_PER_PAGE,
                offset: events.length,
                search: debouncedEventSearch || undefined,
                timeFilter: timeFilter,
                venueIds: enabledVenueIds.length > 0 ? enabledVenueIds : undefined
            });
            // Deduplicate when merging to avoid duplicate keys
            setEvents((prev)=>{
                const existingIds = new Set(prev.map((e)=>e.id));
                const newEvents = result.events.filter((e)=>!existingIds.has(e.id));
                return [
                    ...prev,
                    ...newEvents
                ];
            });
            setHasMoreEvents(result.hasMore);
        } catch (err) {
            console.error("Failed to load more events:", err);
        } finally{
            setLoadingMore(false);
        }
    }, [
        loadingMore,
        hasMoreEvents,
        events.length,
        debouncedEventSearch,
        timeFilter,
        enabledVenueIds
    ]);
    // Refetch events when search, time filter, or venue filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!dataLoaded) return;
        const searchEvents = async ()=>{
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEvents"])({
                    limit: EVENTS_PER_PAGE,
                    offset: 0,
                    search: debouncedEventSearch || undefined,
                    timeFilter: timeFilter,
                    venueIds: enabledVenueIds.length > 0 ? enabledVenueIds : undefined
                });
                setEvents(result.events);
                setHasMoreEvents(result.hasMore);
                setFilteredTotalCount(result.totalCount);
            } catch (err) {
                console.error("Failed to search events:", err);
            }
        };
        searchEvents();
    }, [
        debouncedEventSearch,
        timeFilter,
        enabledVenueIds,
        dataLoaded
    ]);
    const loadMoreHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (loadingMoreHistory || !hasMoreHistory) return;
        setLoadingMoreHistory(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHistory"])({
                filter: historyTimeFilter,
                limit: 50,
                offset: historyShows.length
            });
            setHistoryShows((prev)=>[
                    ...prev,
                    ...result.shows
                ]);
            setHasMoreHistory(result.hasMore);
        } catch (err) {
            console.error("Failed to load more history:", err);
        } finally{
            setLoadingMoreHistory(false);
        }
    }, [
        loadingMoreHistory,
        hasMoreHistory,
        historyShows.length,
        historyTimeFilter
    ]);
    // Lazy load history when on history view
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!dataLoaded) return;
        if (view !== 'history') return;
        const loadHistory = async ()=>{
            setLoadingHistory(true);
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHistory"])({
                    filter: historyTimeFilter,
                    limit: 50,
                    offset: 0
                });
                setHistoryShows(result.shows);
                setHasMoreHistory(result.hasMore);
                setHistoryLoaded(true);
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally{
                setLoadingHistory(false);
            }
        };
        loadHistory();
    }, [
        historyTimeFilter,
        dataLoaded,
        view
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchData();
    }, [
        fetchData
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (dataLoaded && !ready) {
            const timer = setTimeout(()=>setReady(true), 300);
            return ()=>clearTimeout(timer);
        }
    }, [
        dataLoaded,
        ready
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const titles = {
            events: "Omaha Shows | Live Music in Omaha, NE",
            calendar: "Calendar | Omaha Shows",
            history: "Past Shows | Omaha Shows",
            submit: "Submit Show | Omaha Shows",
            myshows: "My Shows | Omaha Shows"
        };
        document.title = titles[view];
    }, [
        view
    ]);
    const venues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const list = sources.map((s)=>({
                id: s.id,
                name: s.name
            }));
        return list.sort((a, b)=>{
            if (a.id === "other") return 1;
            if (b.id === "other") return -1;
            return 0;
        });
    }, [
        sources
    ]);
    const venueUrls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const urls = {};
        for (const s of sources){
            if (s.url) urls[s.id] = s.url;
        }
        return urls;
    }, [
        sources
    ]);
    // Build venue colors from database (with fallback to defaults)
    const venueColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const colors = {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_VENUE_COLORS"]
        };
        for (const s of sources){
            if (s.colorHex) colors[s.id] = s.colorHex;
        }
        return colors;
    }, [
        sources
    ]);
    const justAddedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>getRecentlyAddedIds(events), [
        events
    ]);
    const isJustAdded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>justAddedIds.has(event.id), [
        justAddedIds
    ]);
    const justAddedCount = justAddedIds.size;
    const toggleVenue = (venueId)=>{
        setEnabledVenues((prev)=>{
            const next = new Set(prev);
            if (next.has(venueId)) next.delete(venueId);
            else next.add(venueId);
            return next;
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-texture",
        children: [
            !ready && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 bg-[#0d0d0f] flex flex-col items-center justify-center gap-6 transition-opacity duration-500",
                style: {
                    opacity: dataLoaded ? 0 : 1,
                    pointerEvents: dataLoaded ? "none" : "auto"
                },
                children: error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-6 py-3",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 435,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl md:text-5xl font-black tracking-tight",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent",
                                    children: "OMAHA"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 439,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-white ml-3",
                                    children: "SHOWS"
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 440,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 438,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1.5",
                            children: [
                                0,
                                1,
                                2
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-bounce",
                                    style: {
                                        animationDelay: `${i * 0.15}s`
                                    }
                                }, i, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 444,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 442,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 430,
                columnNumber: 9
            }, this),
            dataLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "md:py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mx-auto md:px-4 ${layout === "compact" ? "max-w-4xl" : "max-w-xl"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "content-container md:rounded-2xl p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#050506] md:rounded-t-2xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setView("events");
                                                setEventSearch("");
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth"
                                                });
                                            },
                                            className: "cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-5xl md:text-6xl font-black tracking-tight select-none",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent",
                                                            children: "OMAHA"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 462,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white ml-3",
                                                            children: "SHOWS"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 463,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                    lineNumber: 461,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center gap-3 mt-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-px w-16 bg-gradient-to-r from-transparent to-gray-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 466,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-500 text-sm tracking-widest uppercase",
                                                            children: "Live Music"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 467,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-px w-16 bg-gradient-to-l from-transparent to-gray-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 468,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 457,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-center flex-wrap gap-2 mt-4",
                                            children: [
                                                [
                                                    "events",
                                                    "calendar",
                                                    "history",
                                                    "submit"
                                                ].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setView(v);
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackViewChange"])(v === "events" ? "shows" : v);
                                                        },
                                                        className: `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === v ? v === "submit" ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30" : "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`,
                                                        children: v === "events" ? "Shows" : v === "submit" ? "Submit" : v.charAt(0).toUpperCase() + v.slice(1)
                                                    }, v, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 474,
                                                        columnNumber: 21
                                                    }, this)),
                                                savedIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setView("myshows");
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackViewChange"])("myshows");
                                                    },
                                                    className: `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === "myshows" ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30" : "text-gray-500 hover:text-gray-300"}`,
                                                    children: [
                                                        "My Shows (",
                                                        savedIds.length,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                    lineNumber: 489,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 472,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 456,
                                    columnNumber: 15
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 504,
                                    columnNumber: 17
                                }, this),
                                (view === "events" || view === "history" || view === "calendar" || view === "myshows") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-400",
                                                    children: [
                                                        view === "events" && (()=>{
                                                            const hasFilters = debouncedEventSearch || timeFilter !== "all" || enabledVenues.size !== sources.length;
                                                            if (hasFilters) {
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-medium text-white",
                                                                            children: filteredTotalCount
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                            lineNumber: 517,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        " shows"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                    lineNumber: 516,
                                                                    columnNumber: 29
                                                                }, this);
                                                            }
                                                            return totalEventCount !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium text-white",
                                                                        children: totalEventCount
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                        lineNumber: 523,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    " shows"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                lineNumber: 522,
                                                                columnNumber: 27
                                                            }, this) : null;
                                                        })(),
                                                        view === "history" && historyLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium text-white",
                                                                    children: historyShows.length
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                    lineNumber: 529,
                                                                    columnNumber: 27
                                                                }, this),
                                                                hasMoreHistory && "+",
                                                                " shows"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 528,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        (view === "events" || view === "history") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    viewBox: "0 0 24 24",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        strokeWidth: 2,
                                                                        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                        lineNumber: 538,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    placeholder: "Search...",
                                                                    value: view === "events" ? eventSearch : historySearch,
                                                                    onChange: (e)=>view === "events" ? setEventSearch(e.target.value) : setHistorySearch(e.target.value),
                                                                    className: "w-44 sm:w-56 pl-8 pr-8 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                    lineNumber: 540,
                                                                    columnNumber: 27
                                                                }, this),
                                                                (view === "events" ? eventSearch : historySearch) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>view === "events" ? setEventSearch("") : setHistorySearch(""),
                                                                    className: "absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        className: "w-4 h-4",
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        viewBox: "0 0 24 24",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: 2,
                                                                            d: "M6 18L18 6M6 6l12 12"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                            lineNumber: 553,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                        lineNumber: 552,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                                    lineNumber: 548,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 25
                                                        }, this),
                                                        view === "history" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$FiltersDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FiltersDropdown"], {
                                                            mode: "history",
                                                            venues: venues,
                                                            enabledVenues: enabledVenues,
                                                            toggleVenue: toggleVenue,
                                                            venueColors: venueColors,
                                                            timeFilter: historyTimeFilter,
                                                            setTimeFilter: setHistoryTimeFilter,
                                                            isOpen: filtersOpen,
                                                            onOpenChange: setFiltersOpen
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 560,
                                                            columnNumber: 25
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$FiltersDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FiltersDropdown"], {
                                                            venues: venues,
                                                            enabledVenues: enabledVenues,
                                                            toggleVenue: toggleVenue,
                                                            venueColors: venueColors,
                                                            timeFilter: timeFilter,
                                                            setTimeFilter: setTimeFilter,
                                                            justAddedCount: justAddedCount,
                                                            isOpen: filtersOpen,
                                                            onOpenChange: setFiltersOpen
                                                        }, void 0, false, {
                                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                            lineNumber: 562,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                    lineNumber: 534,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 509,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-6 -mx-6 flex items-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                viewBox: "0 0 800 24",
                                                className: "w-full h-4 text-gray-500",
                                                preserveAspectRatio: "none",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M0,12 C40,12 60,12 80,12 C100,12 110,4 130,4 C145,4 150,8 155,12 C160,16 170,20 185,20 C200,20 210,16 220,12 C235,6 250,4 270,4 C290,4 310,8 330,12 L360,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 569,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M0,12 C40,12 60,12 80,12 C100,12 110,20 130,20 C145,20 150,16 155,12 C160,8 170,4 185,4 C200,4 210,8 220,12 C235,18 250,20 270,20 C290,20 310,16 330,12 L360,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 570,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                                        cx: "400",
                                                        cy: "12",
                                                        rx: "8",
                                                        ry: "5",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 571,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        cx: "400",
                                                        cy: "12",
                                                        r: "2",
                                                        fill: "currentColor"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 572,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M360,12 Q380,5 392,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M360,12 Q380,19 392,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 106
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M440,12 Q420,5 408,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 574,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M440,12 Q420,19 408,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 574,
                                                        columnNumber: 106
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M800,12 C760,12 740,12 720,12 C700,12 690,4 670,4 C655,4 650,8 645,12 C640,16 630,20 615,20 C600,20 590,16 580,12 C565,6 550,4 530,4 C510,4 490,8 470,12 L440,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 575,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M800,12 C760,12 740,12 720,12 C700,12 690,20 670,20 C655,20 650,16 645,12 C640,8 630,4 615,4 C600,4 590,8 580,12 C565,18 550,20 530,20 C510,20 490,16 470,12 L440,12",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                        lineNumber: 576,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                lineNumber: 568,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 567,
                                            columnNumber: 19
                                        }, this),
                                        view === "events" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$EventList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EventList"], {
                                            events: events,
                                            layout: layout,
                                            filter: {
                                                enabledVenues,
                                                showPast: false,
                                                timeFilter,
                                                searchQuery: debouncedEventSearch
                                            },
                                            venueColors: venueColors,
                                            isJustAdded: isJustAdded,
                                            hasMore: hasMoreEvents,
                                            loadingMore: loadingMore,
                                            onLoadMore: loadMoreEvents,
                                            isSaved: isSaved,
                                            onToggleSave: handleToggleSave
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 581,
                                            columnNumber: 21
                                        }, this) : view === "myshows" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MyShowsList, {
                                            savedIds: savedIds,
                                            venueColors: venueColors,
                                            onToggleSave: handleToggleSave
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 583,
                                            columnNumber: 21
                                        }, this) : view === "history" ? loadingHistory && !historyLoaded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-center py-12",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                                lineNumber: 587,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 586,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$HistoryList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HistoryList"], {
                                            shows: historyShows,
                                            enabledVenues: enabledVenues,
                                            searchQuery: debouncedHistorySearch,
                                            venueColors: venueColors,
                                            venueUrls: venueUrls,
                                            timeFilter: historyTimeFilter,
                                            hasMore: hasMoreHistory,
                                            loadingMore: loadingMoreHistory,
                                            onLoadMore: loadMoreHistory
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 590,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$CalendarView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarView"], {
                                            venueColors: venueColors,
                                            enabledVenues: enabledVenues
                                        }, void 0, false, {
                                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                            lineNumber: 593,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true),
                                view === "submit" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$SubmitShowForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubmitShowForm"], {}, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 598,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$ContactModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ContactModal"], {
                                    isOpen: showContact,
                                    onClose: ()=>setShowContact(false)
                                }, void 0, false, {
                                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                    lineNumber: 599,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 455,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 454,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$src$2f$components$2f$SeoStructuredData$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeoStructuredData"], {
                        events: events
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 602,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 453,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 left-4 z-40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setShowContact(true),
                    className: "flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-5 h-5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 608,
                            columnNumber: 90
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 608,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 607,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 606,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 right-4 z-40 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFiltersOpen(true),
                        className: "flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                lineNumber: 614,
                                columnNumber: 90
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 614,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 613,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            }),
                        className: "flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M5 10l7-7m0 0l7 7m-7-7v18"
                            }, void 0, false, {
                                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                                lineNumber: 617,
                                columnNumber: 90
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 617,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                        lineNumber: 616,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 612,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 transition-all duration-300 ${showSaveToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm md:text-base",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Added to My Shows"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 628,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$ShowCal$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setView("myshows");
                                setShowSaveToast(false);
                            },
                            className: "underline hover:no-underline font-medium",
                            children: "View"
                        }, void 0, false, {
                            fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                            lineNumber: 629,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                    lineNumber: 627,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
                lineNumber: 622,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Dev/ShowCal/web/app/page.tsx",
        lineNumber: 428,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Dev_ShowCal_web_5619996b._.js.map