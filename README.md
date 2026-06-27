# saazneupane.github.io

Personal portfolio website for Saaz Neupane — Data Analyst & Full-Stack Developer.

**Live:** [saazneupane.com.np](https://saazneupane.com.np)

## Stack

- HTML5 / CSS3 (custom design system, CSS variables, dark mode)
- Vanilla JavaScript (no framework)
- jQuery + Owl Carousel (references slider)
- Font Awesome (icons)
- Google Fonts — Josefin Sans

## Features

- Dark / light mode (respects `prefers-color-scheme`, persists via `localStorage`)
- Sticky nav with scroll progress bar and active section highlight
- Project cards with hover tech-tag reveal, whole card links to GitHub
- Copy-to-clipboard email button
- Mobile hamburger nav
- Back-to-top button
- Page fade-in on load
- Fully responsive (375px → 1920px)
- Semantic HTML, ARIA labels, keyboard accessible

## Structure

```
├── index.html
├── css/
│   ├── style.css          # all custom styles + design tokens
│   └── owl.carousel.css   # vendor
├── js/
│   ├── main.js            # all site logic
│   ├── jquery-2.1.4.min.js
│   └── owl.carousel.min.js
├── img/
│   ├── profile.jpg
│   ├── logo.png
│   └── project/
└── file/
    └── SaazNeupaneResume.pdf
```
