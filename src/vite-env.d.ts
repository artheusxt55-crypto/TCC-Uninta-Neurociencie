
/// <reference types="vite/client" />

import type {
    DetailedHTMLProps,
    HTMLAttributes
} from "react";

declare module "*.css";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "spline-viewer": DetailedHTMLProps<
                HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                url?: string;
            };
        }
    }
}

export {};
