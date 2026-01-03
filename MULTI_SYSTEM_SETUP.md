# Multi-System ROM Library Setup Guide

## Overview

Your Hugo-Retro site **automatically discovers** gaming systems from mounted data directories! Simply mount a new gamelist.xml and it will appear in the system dropdown.

## How It Works

The system dropdown is **automatically generated** by scanning the `data/` directory for any subdirectories containing gamelist.xml files. No manual system configuration needed!

## Current Structure

```
config.toml
  ↓
[[module.mounts]] → data/all/gamelist.xml     → "All Systems" in dropdown
[[module.mounts]] → data/neogeo/gamelist.xml  → "Neo Geo" in dropdown
[[module.mounts]] → data/snes/gamelist.xml    → "SNES" in dropdown
  ↓
Each system automatically appears in the header dropdown!
```

## Adding a New System

### Step 1: Prepare Your ROM Data

Organize your system's files:

```
/path/to/system/roms/
├── gamelist.xml
└── media/
    ├── images/
    │   └── [game images]
    └── thumbnails/
        └── [game thumbnails]
```

### Step 2: Update config.toml

Add module mounts for the new system. The `target` directory name becomes the system ID:

```toml
# Example: Adding SNES (system ID will be "snes")
[[module.mounts]]
  source = '/path/to/snes/roms'
  includeFiles = "gamelist.xml"
  target = 'data/snes'

[[module.mounts]]
  source = '/path/to/snes/roms/media'
  target = 'static/media/snes'
```

### Step 3: (Optional) Add Friendly Name

By default, the system ID is capitalized and used as the display name. To customize:

```toml
[params.systemNames]
  snes = "Super Nintendo (SNES)"
  neogeo = "Neo Geo"
  genesis = "Sega Genesis / Mega Drive"
```

If not specified, "snes" will display as "Snes", "neogeo" as "Neogeo", etc.

### Step 4: Rebuild

```bash
npm run build
```

That's it! Your new system automatically appears in the dropdown! 🎉

### System Icons

Use emoji icons to make the dropdown more visual:

- 🎮 - Generic gaming
- 🕹️ - Arcade
- 👾 - Retro gaming
- 🎯 - Target/action games
- ⚔️ - Fighting games
- 🏎️ - Racing games

## Supported Systems (ScreenScraper IDs)

Common system IDs you might use:

| System             | ID           | Icon Suggestion |
| ------------------ | ------------ | --------------- |
| All Systems        | all          | 🎮              |
| Super Nintendo     | snes         | 🎮              |
| Sega Genesis       | genesis      | 🎮              |
| Nintendo 64        | n64          | 🎮              |
| PlayStation        | psx          | 🎮              |
| Game Boy           | gb           | 🎮              |
| Game Boy Advance   | gba          | 🎮              |
| NES                | nes          | 🎮              |
| Sega Master System | mastersystem | 🎮              |
| Atari 2600         | atari2600    | 🎮              |
| Arcade             | arcade       | 🕹️              |

## Complete Example

Here's a complete example with 3 systems:

```toml
#################################### Plugins ##########################################

[[module.mounts]]
source = "static/images"
target = "static/images"

### All Systems
[[module.mounts]]
  source = '/Users/florian/Workspace/goretro'
  includeFiles = "gamelist.xml"
  target = 'data/all'

[[module.mounts]]
  source = '/Users/florian/Workspace/goretro/media'
  target = 'static/media/all'

### SNES
[[module.mounts]]
  source = '/Users/florian/Roms/snes'
  includeFiles = "gamelist.xml"
  target = 'data/snes'

[[module.mounts]]
  source = '/Users/florian/Roms/snes/media'
  target = 'static/media/snes'

### Genesis
[[module.mounts]]
  source = '/Users/florian/Roms/genesis'
  includeFiles = "gamelist.xml"
  target = 'data/genesis'

[[module.mounts]]
  source = '/Users/florian/Roms/genesis/media'
  target = 'static/media/genesis'

########################### Default parameters ##########################
[params]
logo = "/images/favicon.png"
logo_width = "150px"
description = "Multi-System ROM Library"
author = "Florian Dambrine"
copyright = "{year}"

# Gaming Systems Configuration
[[params.systems]]
  id = "all"
  name = "All Systems"
  icon = "🎮"

[[params.systems]]
  id = "snes"
  name = "Super Nintendo (SNES)"
  icon = "🎮"

[[params.systems]]
  id = "genesis"
  name = "Sega Genesis"
  icon = "🎮"
```

## Future JSON Endpoints

To add system-specific JSON endpoints, you would create:

```
layouts/systems/snes.json
layouts/systems/genesis.json
```

Each containing:

```
{{ $games := (index $.Site.Data.snes "gamelist").game }}
{{ $games | jsonify }}
```

Then update `useRoms.tsx` to fetch from `/systems/${system}.json`.

## How It Works

1. **Header Dropdown**: Shows all systems from `params.systems`
2. **System Selection**: Changes URL to `?system=snes`
3. **Data Loading**: Currently loads from `/index.json` (all systems)
4. **Future Enhancement**: Will load from system-specific endpoints

## Testing

After adding a system:

1. Rebuild: `npm run build`
2. Open site: http://localhost:3001
3. Click system dropdown in header
4. Select your new system
5. ROMs should filter to that system

## Troubleshooting

**System doesn't appear in dropdown?**

- Check `[[params.systems]]` in config.toml
- Ensure `id`, `name`, and `icon` are set

**No ROMs showing?**

- Check `[[module.mounts]]` paths are correct
- Ensure `gamelist.xml` exists at source path
- Check `target = 'data/systemid'` matches system id

**Images not loading?**

- Verify media mount: `source = '/path/media'`
- Check `target = 'static/media/systemid'`
- Ensure image paths in gamelist.xml are correct
