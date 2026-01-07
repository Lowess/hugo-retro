# Hugo Retro Museum 🎮

A beautiful, modern web interface for browsing your retro game ROM collections. Built with Hugo, Preact, and Tailwind CSS.

![System Support](https://img.shields.io/badge/systems-SNES%20%7C%20Neo%20Geo%20%7C%20N64%20%7C%20more-blue)
![Performance](https://img.shields.io/badge/build-optimized%20with%20symlinks-green)

## ✨ Features

- 🎨 **Modern UI** - Beautiful card-based interface with smooth animations
- 🔍 **Advanced Filtering** - Search by name, genre, publisher, region/language
- 🌐 **Multi-System** - Support for multiple retro gaming systems
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast** - Optimized builds with symlinked media (10-100x faster)
- 🖼️ **Rich Media** - Display game screenshots, metadata, ratings
- 🎯 **Smart Deduplication** - Automatically removes duplicate ROMs
- 🚀 **Unraid Ready** - Optimized for Unraid deployments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Hugo Extended (installed automatically via `hugo-bin-extended`)
- ROM collections with `gamelist.xml` metadata (from RetroPie, EmulationStation, etc.)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hugo-retro

# Install dependencies
npm install

# Configure your ROM paths (see Configuration below)
vim config.toml

# Build the site
npm run build

# Start development server
npm run dev
```

Visit `http://localhost:3001` to see your ROM collection!

## ⚙️ Configuration

### 1. Configure Data Sources

Edit `config.toml` and add your ROM directories:

```toml
# Data mounts (gamelist.xml only)
[[module.mounts]]
  source = '/path/to/your/roms/snes'
  includeFiles = "gamelist.xml"
  target = 'data/snes'

[[module.mounts]]
  source = '/path/to/your/roms/neogeo'
  includeFiles = "gamelist.xml"
  target = 'data/neogeo'
```

### 2. Configure Media Paths (Symlinks)

Add media paths for optimized builds:

```toml
[params.mediaPaths]
  snes = '/path/to/your/roms/snes/media'
  neogeo = '/path/to/your/roms/neogeo/media'
  dreamcast = '/path/to/your/roms/dreamcast/media'
```

**Important**: Media is **NOT** copied during builds. Instead, symlinks are created automatically. This makes builds 10-100x faster! 🚀

### 3. Customize System Names

```toml
[params.systemNames]
  snes = "Super Nintendo (SNES)"
  neogeo = "Neo Geo"
  dreamcast = "Sega Dreamcast"
```

### 4. Customize System Colors

```toml
[params.systemColors]
  snes = "from-purple-600 via-violet-500 to-purple-400"
  neogeo = "from-blue-600 via-cyan-500 to-teal-500"
```

## 📦 Build Process

### Development

```bash
npm run dev
# Opens http://localhost:3001 with hot-reload
```

### Production Build

```bash
npm run build
# Output: public/
```

The build process:

1. ✅ Compiles Vite/Preact components
2. ✅ Generates Hugo static site
3. ✅ **Automatically creates symlinks** for media (via `postbuild` hook)

## 🐳 Unraid Deployment

For detailed Unraid setup, see [UNRAID-SETUP.md](UNRAID-SETUP.md).

**Quick Start**:

```bash
# Build the site
npm run build

# Start Docker container
docker-compose -f docker-compose.unraid.yml up -d
```

**Key Points**:

- ✅ Symlinks work with proper Docker volume mounts
- ✅ Nginx configured to follow symlinks
- ✅ No media duplication required
- ✅ Direct access to your ROM volumes

## 📚 Documentation

- **[UNRAID-SETUP.md](UNRAID-SETUP.md)** - Complete Unraid deployment guide
- **[scripts/README.md](scripts/README.md)** - Build scripts documentation
- **[nginx.conf](nginx.conf)** - Production web server configuration

## 🛠️ Available Commands

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start development server with hot-reload         |
| `npm run build`       | Production build with automatic symlink creation |
| `npm run preview`     | Preview production build locally                 |
| `npm run clean:media` | Remove all media symlinks                        |
| `npm test`            | Run tests                                        |
| `npm run lint`        | Lint JavaScript/TypeScript                       |
| `npm run lint:fix`    | Auto-fix linting issues                          |

## 🎯 Performance Optimization

### Build Time Comparison

| Method                | Build Time | Disk Usage     | Notes                |
| --------------------- | ---------- | -------------- | -------------------- |
| **Hugo Copy (old)**   | 5-10 min   | 2x media size  | Copies all media     |
| **Symlinks (new)** ✅ | 10-30 sec  | No duplication | Direct volume access |

### How Symlinks Work

1. Hugo builds site structure (fast, no media)
2. `scripts/link-media.js` creates symlinks in `public/media/`
3. Symlinks point to your ROM volumes
4. Web server follows symlinks to serve media

**Result**: 10-100x faster builds with zero media duplication! 🎉

## 🎮 Supported Systems

Currently configured systems:

- Super Nintendo (SNES)
- Neo Geo
- (Add more in `config.toml`)

**Easy to add more**:

1. Add data mount in `config.toml`
2. Add media path to `[params.mediaPaths]`
3. Rebuild: `npm run build`

## 🔧 Troubleshooting

### Images not loading

1. Check symlinks exist: `ls -la public/media/`
2. Verify paths in `config.toml` match actual directories
3. Ensure web server allows symlinks (nginx: `disable_symlinks off;`)

### Slow builds

- ✅ Ensure you removed old `[[module.mounts]]` for media in `config.toml`
- ✅ Symlinks should be used instead of Hugo static mounts
- ✅ Run `npm run clean:media` and rebuild

### Symlinks not created

```bash
# Run manually to see errors
node scripts/link-media.js
```

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Hugo](https://gohugo.io/)
- UI powered by [Preact](https://preactjs.com/) and [Tailwind CSS](https://tailwindcss.com/)
- Designed for [Unraid](https://unraid.net/) but works anywhere

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

**Enjoy your retro gaming collection! 🎮✨**
