example:
bg-[#0b0b14]
in brandTheme.css
=> .bg-brand: { #0b0b14}
or later in theme.ts
// tailwind.config.ts
theme: {
extend: {
colors: {
'brand-bg': '#0b0b14'
}
}
}
And then also use as brand-bg

However then it'd be more configure-driven, right?
