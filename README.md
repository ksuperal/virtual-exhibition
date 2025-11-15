# Virtual Exhibition - Journey of Home

An interactive 3D virtual exhibition exploring the concept of "home" through five immersive stages of life.

## 🎨 Exhibition Overview

This virtual exhibition takes visitors on an emotional journey through five distinct rooms, each representing a different perspective on what "home" means:

### Room 1: Home in Memory
A warm, nostalgic childhood home filled with familiar objects and gentle memories. Visitors reconnect with their earliest emotional memories through interactive furniture and ambient sounds.

### Room 2: Burdens & Growth
An Alice in Wonderland-inspired surreal space where visitors must navigate obstacles and learn to let go of the burdens they accumulate as they grow up.

### Room 3: Wine Glass Metaphor
A dark, contemplative room exploring how the same events can have different meanings to different people. Like wine tasting different in different glasses, our interpretation shapes our experience.

### Room 4: Cosmic Perspective
A vast space environment that helps visitors see their problems from a universal scale. Your struggle becomes one small star in an infinite galaxy, offering perspective and peace.

### Room 5: Home We Create
A warm communal dining space where visitors share reflections, write postcards to their future selves, and realize that home is something we build together.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 Controls

- **WASD** or **Arrow Keys** - Move around
- **Mouse** - Look around (click to lock pointer)
- **E** - Interact with objects
- **ESC** - Close modals / Exit pointer lock
- **1-5** - Quick navigation between rooms (development)

## 🏗️ Project Structure

```
FCI/
├── src/
│   ├── main.js                 # Entry point
│   ├── core/
│   │   ├── SceneManager.js     # Main scene and room management
│   │   ├── FirstPersonControls.js # Camera controls
│   │   ├── InteractionManager.js  # Object interaction system
│   │   ├── UIManager.js        # UI modals and overlays
│   │   └── AudioManager.js     # Sound system
│   ├── rooms/
│   │   ├── BaseRoom.js         # Base room class
│   │   ├── Room1.js            # Home in Memory
│   │   ├── Room2.js            # Burdens & Growth
│   │   ├── Room3.js            # Wine Glass Metaphor
│   │   ├── Room4.js            # Cosmic Perspective
│   │   └── Room5.js            # Home We Create
│   └── styles/
│       └── main.css            # UI styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Features

### Interactive Elements
- **Object Interactions** - Click or press E on highlighted objects
- **Text Input** - Share your thoughts and memories
- **Multi-step Forms** - Guided reflection experiences
- **Community Wall** - See messages from other visitors
- **Postcards** - Write to your future self (saved locally)

### Visual Effects
- Procedurally generated 3D environments
- Dynamic lighting and shadows
- Particle systems and floating text
- Canvas textures for user-generated content
- Smooth animations and transitions

### Atmospheric Design
- Each room has unique color palette and mood
- Ambient lighting sets emotional tone
- Symbolic objects tell stories
- Progressive emotional journey

## 🛠️ Customization

### Adding New Rooms

1. Create a new room class extending `BaseRoom`:
```javascript
import { BaseRoom } from './BaseRoom.js';

export class Room6 extends BaseRoom {
  async init() {
    // Create your room environment
  }

  async onEnter() {
    // Called when entering the room
  }

  update(deltaTime) {
    // Called every frame
  }
}
```

2. Register in `SceneManager.js`:
```javascript
this.rooms.set(6, new Room6(this.scene, this.interactionManager, this.audioManager));
```

### Adding Audio

Audio files should be placed in a `public/audio/` directory and loaded using the AudioManager:

```javascript
const sound = this.audioManager.createAmbientSound('background', {
  volume: 0.7,
  loop: true
});
```

### Modifying UI

UI templates are in `UIManager.js`. You can create custom modals:

```javascript
uiManager.showModal('Title', '<p>Your HTML content here</p>');
```

## 📊 Data Persistence

User data is stored in localStorage:
- **Postcards** - Messages to future self
- **Community Messages** - Shared reflections

To clear saved data:
```javascript
localStorage.clear();
```

## 🎯 PACT Framework

Each room is designed using the PACT framework:

- **People** - Target audience and their needs
- **Activities** - What visitors do in the space
- **Context** - Emotional and physical environment
- **Technologies** - Interactive systems used

## 🌟 Future Enhancements

Potential additions:
- VR headset support (WebXR)
- Multiplayer / social features
- Backend server for persistent community wall
- Audio narration and ambient soundscapes
- Mobile touch controls
- Accessibility features (screen reader support, subtitles)
- Analytics to track visitor journey
- Email delivery for postcards after one year

## 📝 Technical Notes

### Performance
- **Heavily optimized** for smooth 50-60 FPS performance
- Optimized for desktop browsers (Chrome, Firefox, Edge)
- Uses procedural geometry (no external 3D models needed)
- Efficient particle systems with automatic cleanup and limits
- Optimized shadow mapping for visual quality
- Built-in performance monitor (see `PERFORMANCE.md`)

**Key Optimizations:**
- Room 2 checkered floor: 720 meshes → 1 textured plane
- Reduced geometry segments: 60-75% fewer vertices
- Particle limits: 50% reduction in particle count
- Shadow optimizations: BasicShadowMap, 1024x1024 resolution
- Canvas texture debouncing
- See full details in `PERFORMANCE.md`

### Browser Compatibility
- Modern browsers with WebGL support required
- Pointer Lock API for first-person controls
- Canvas API for dynamic textures
- LocalStorage for data persistence

## 🤝 Contributing

This is an educational/artistic project. Feel free to:
- Experiment with room designs
- Add new interactive elements
- Improve visual effects
- Enhance accessibility

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

Inspired by:
- Museum exhibition design principles
- Interactive storytelling
- Contemplative game design
- The universal search for meaning and belonging

---

**Experience the journey. Rediscover home.**
