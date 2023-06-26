import { defineConfig } from 'vite';
import { meta } from 'vite-plugin-meta-tags';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	define: {
		process:{
			env: process.env
		}
	},
	plugins: [
		meta({
			// `title`, `og:title`, `twitter:title`
			title: 'Helpers CSS', // any string
			// `meta:description`, `og:description`, `twitter:description`
			description: 'Herramienta que permite calcular medidas CSS, Helpers Css ofrece además la posibilidad de generar paletas de colores y exportarlas en CSS y SASS/SCSS', // any string
			// `og:url`, `twitter:url`, `twitter:domain`
			url: 'https://rep98.github.io/helperscssmos', // example value: 'https://google.com'
			// `og:image`, `twitter:image` (also adds `twitter:card`)
			img: 'logo1024.png', // path to image relative to your index.html, or a image on a CDN
			// `meta:theme-color`, `meta:msapplication-TileColor`
			color: '#FF9800', // a hex color 
		}),
        VitePWA({ 
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{ts,js,css,html,ico,png,svg}']
			},
			includeAssets: ['favicon.ico', '/assests'],
			manifest: {
				name: 'Helpers CSS',
				short_name: 'HelCss',
				description: 'Herramienta que permite calcular medidas CSS, Helpers Css ofrece además la posibilidad de generar paletas de colores y exportarlas en CSS y SASS/SCSS',
				theme_color: '#FF9800',
				icons: [
					{
						src: 'logo192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'playstore.png',
						sizes: '512x512',
						type: 'image/png'
					}
				],
				lang: "es",
				background_color: "#212121"
			}
		})
	],
    build: {
        outDir: "docs",
        assetsDir: "assets"
    }
})