import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { createIsland } from "preact-island";

import RomsCardGrid from "./components/romsCardGrid";

interface Props {
    initialSystem?: string;
}

function RomsWidget({ initialSystem = 'all' }: Props) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <RomsCardGrid initialSystem={initialSystem} />
        </div>
    );
}

// This is a workaround to get the current script URL.
// The way it works is that Vite has access to the URL of the script,
// and we can pass parameters in the script URL to dynamically decide
// where to mount the widget.
// The import.meta.url points to file://module_path when at build time.

// Get the current script url
console.log(import.meta)
const scriptUrl = new URL(import.meta.url)
const mountAt = scriptUrl.searchParams.get('mount_at');

const island = createIsland(RomsWidget);

island.render({
    selector: mountAt as string,
    replace: true,
    propsSelector: `[data-island-props="${mountAt}"]`
})
