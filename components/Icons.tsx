type P = { size?: number; className?: string };
const base = (size: number, className?: string) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className,
});
export const Sun = ({ size = 22, className }: P) => (<svg {...base(size, className)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const List = ({ size = 22, className }: P) => (<svg {...base(size, className)}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>);
export const Plus = ({ size = 26, className }: P) => (<svg {...base(size, className)}><path d="M12 5v14M5 12h14" /></svg>);
export const Chart = ({ size = 22, className }: P) => (<svg {...base(size, className)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
export const Gear = ({ size = 22, className }: P) => (<svg {...base(size, className)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>);
export const Timer = ({ size = 18, className }: P) => (<svg {...base(size, className)}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6M12 2v3" /></svg>);
export const Play = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M7 5v14l11-7z" /></svg>);
export const Pause = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M8 5v14M16 5v14" /></svg>);
export const Check = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M5 12l5 5L20 7" /></svg>);
export const Back = ({ size = 20, className }: P) => (<svg {...base(size, className)}><path d="M15 18l-6-6 6-6" /></svg>);
export const Copy = ({ size = 18, className }: P) => (<svg {...base(size, className)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>);
export const Swap = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" /></svg>);
export const Flag = ({ size = 14, className }: P) => (<svg {...base(size, className)}><path d="M4 22V4a1 1 0 0 1 1-1h11l-2 4 2 4H5" /></svg>);
export const Scissors = ({ size = 14, className }: P) => (<svg {...base(size, className)}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" /></svg>);
export const X = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M18 6L6 18M6 6l12 12" /></svg>);
export const Reset = ({ size = 16, className }: P) => (<svg {...base(size, className)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>);
export const Chevron = ({ size = 18, className }: P) => (<svg {...base(size, className)}><path d="M9 6l6 6-6 6" /></svg>);
