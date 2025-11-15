# Quick Start Guide

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - Click anywhere to start
   - Click again to lock pointer for first-person controls

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Forward |
| S / ↓ | Move Backward |
| A / ← | Move Left |
| D / → | Move Right |
| Mouse | Look Around |
| E | Interact with Objects |
| ESC | Close Modal / Exit Pointer Lock |
| 1-5 | Jump to Room (Dev Mode) |
| Shift | Sprint (Move Faster) |

## Room Navigation

The exhibition has 5 rooms arranged in sequence:

1. **Room 1** - Childhood home (position: x=0)
2. **Room 2** - Burdens journey (position: x=30)
3. **Room 3** - Interpretation (position: x=60)
4. **Room 4** - Cosmic view (position: x=90)
5. **Room 5** - Community (position: x=120)

Press number keys 1-5 to quickly jump between rooms during development.

## Testing Tips

### Test Interactions
- Look for objects that show a prompt when you look at them
- Press E or click to trigger interactions
- Try the following interactive elements:
  - **Room 1**: Chair, bicycle
  - **Room 2**: Signs, burden drop zone
  - **Room 3**: Wine glasses
  - **Room 4**: Tablet pedestal
  - **Room 5**: Community wall, postcard station

### Test UI
- Fill out text forms
- Submit memories and reflections
- Check localStorage after Room 5 for saved postcards:
  ```javascript
  localStorage.getItem('postcards')
  ```

### Performance Testing
- Monitor FPS in browser DevTools
- Check console for any errors
- Test on different screen sizes

## Development Workflow

### Adding New Features

1. **New Room Content:**
   - Edit the relevant room file in `src/rooms/`
   - Use helper methods from `BaseRoom.js`
   - Add interactive objects with `this.addInteractiveObject()`

2. **New UI Modal:**
   ```javascript
   const uiManager = window.app?.uiManager;
   uiManager.showModal('Title', 'Content');
   ```

3. **New Animation:**
   - Add to the room's `update(deltaTime)` method
   - Use `this.animationTime` for time-based effects

### Common Issues

**Pointer not locking:**
- Click on canvas area
- Check browser console for errors

**Objects not interactive:**
- Ensure you're within interaction distance (3 units)
- Look directly at the object (crosshair centered)
- Check console for interaction setup errors

**Performance issues:**
- Reduce shadow quality in SceneManager
- Lower particle counts in Room 3 & 4
- Disable shadow casting on smaller objects

## Build for Production

```bash
npm run build
```

Output in `dist/` directory. Deploy to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- AWS S3

## Browser DevTools

### Useful Console Commands

```javascript
// Access scene manager
window.app.sceneManager

// Jump to specific room
window.app.sceneManager.enterRoom(3)

// Check current room
window.app.sceneManager.currentRoom

// Access camera
window.app.sceneManager.getCamera()

// Clear saved data
localStorage.clear()
```

## Performance Troubleshooting

### Enable FPS Monitor
Edit `src/utils/PerformanceMonitor.js` and change:
```javascript
this.enabled = true;  // Shows FPS in top-right corner
```

Or toggle at runtime via console:
```javascript
window.app.sceneManager.performanceMonitor.toggle();
```

### Still Laggy?
See `PERFORMANCE.md` for detailed optimization guide and troubleshooting tips.

### Expected Performance
- **Modern PC/Laptop:** 50-60 FPS
- **Older Hardware:** 30-45 FPS
- If below 30 FPS, check PERFORMANCE.md for additional tweaks

---

## Next Steps

1. ✅ Test all 5 rooms
2. ✅ Verify all interactions work
3. ✅ Check UI/UX flow
4. ✅ Verify performance (50-60 FPS expected)
5. 📝 Add custom content/memories
6. 🎵 Add audio files (optional)
7. 🚀 Build and deploy

---

Happy exploring! 🏠✨
