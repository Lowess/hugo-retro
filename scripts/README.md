# Build Scripts

This directory contains build-time scripts for the Hugo Retro project.

## Media Management Scripts

### `link-media.js`

**Purpose**: Creates symlinks from source media directories to `public/media/` after Hugo builds.

**Why**: Avoid copying large media files during Hugo builds. This significantly speeds up build times, especially when dealing with hundreds of MB or GB of ROM images.

**Usage**:

- Automatically runs after `npm run build` (via `postbuild` hook)
- Can be run manually: `node scripts/link-media.js`

**Configuration**: Media paths are defined in `config.toml` under `[params.mediaPaths]`:

```toml
[params.mediaPaths]
  snes = '/path/to/snes/media'
  neogeo = '/path/to/neogeo/media'
  dreamcast = '/roms/dreamcast/media'
```

**Output**: Creates symlinks at `public/media/{system}` → source path

### `clean-media.js`

**Purpose**: Removes all symlinks from `public/media/` directory.

**Usage**: `node scripts/clean-media.js`

**When to use**:

- Debugging symlink issues
- Before switching from symlinks to copied files
- Manual cleanup

## Unraid Setup

When deploying to Unraid, ensure your Docker container or web server:

1. Has access to the ROM media volumes
2. Allows following symlinks (nginx: `disable_symlinks off;`)
3. Mounts the media paths at the same locations as in `config.toml`

### Example Docker Volume Mounts

```yaml
volumes:
  - /mnt/user/roms/snes/media:/Users/florian/Workspace/goretro/media:ro
  - /mnt/user/roms/neogeo/media:/Users/florian/Documents/Roms/neogeo/roms/media:ro
  - ./public:/usr/share/nginx/html:ro
```

### Nginx Configuration

```nginx
location /media/ {
    alias /usr/share/nginx/html/media/;
    disable_symlinks off;  # Allow following symlinks
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

## Benefits

✅ **Fast builds**: Hugo doesn't copy media files
✅ **Disk space**: No duplication of media
✅ **Flexibility**: Easy to add/remove systems
✅ **Unraid-friendly**: Direct access to volume mounts
✅ **CDN-ready**: Can later switch to external media URLs
