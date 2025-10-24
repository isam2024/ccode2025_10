# Contributing to Midjourney-ComfyUI Clone

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature/fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env file
cp .env.example .env

# Start development servers
npm run dev
```

## Code Style

### JavaScript/JSX

- Use ES6+ features
- Use functional components with hooks in React
- Use async/await for asynchronous code
- Add comments for complex logic
- Follow existing code formatting

### CSS

- Use class-based styling
- Keep styles modular (one CSS file per component)
- Use meaningful class names
- Maintain responsive design

### Naming Conventions

- **Variables**: camelCase
- **Components**: PascalCase
- **Files**: kebab-case for utilities, PascalCase for components
- **Constants**: UPPER_SNAKE_CASE

## Project Structure

```
server/           - Backend code
  ├── index.js              - Main server
  ├── comfyui-client.js     - ComfyUI integration
  ├── workflow-generator.js - Workflow generation
  └── job-queue.js          - Job management

client/src/       - Frontend code
  ├── components/  - React components
  ├── App.jsx     - Main app
  └── main.jsx    - Entry point
```

## Adding Features

### Backend Feature

1. Add logic to appropriate module (or create new one)
2. Add API endpoint in `server/index.js` if needed
3. Update documentation
4. Test the integration

Example:
```javascript
// server/index.js
app.post('/api/new-feature', async (req, res) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Feature

1. Create component in `client/src/components/`
2. Add styles in matching CSS file
3. Import and use in parent component
4. Update documentation

Example:
```jsx
// client/src/components/NewFeature.jsx
import './NewFeature.css';

function NewFeature({ prop }) {
  return (
    <div className="new-feature">
      {/* Implementation */}
    </div>
  );
}

export default NewFeature;
```

## Testing

Currently, the project uses manual testing. Before submitting a PR:

1. Test all affected features
2. Test error scenarios
3. Verify UI responsiveness
4. Check browser console for errors
5. Test ComfyUI integration

## Pull Request Process

1. **Update Documentation**: Update README.md if you add features
2. **Test Thoroughly**: Ensure all features work as expected
3. **Clear Description**: Explain what your PR does and why
4. **Small PRs**: Keep changes focused and atomic
5. **Follow Style**: Match existing code style

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Tested manually
- [ ] No console errors
```

## Adding New Midjourney Parameters

To add support for a new Midjourney-style parameter:

1. **Update Parser** (`server/workflow-generator.js`):
```javascript
static parseMidjourneyParams(fullPrompt) {
  // ... existing code ...

  // Add new parameter parsing
  const newParamMatch = fullPrompt.match(/--newparam\s+(\d+)/i);
  if (newParamMatch) {
    params.options.newParam = parseInt(newParamMatch[1]);
    params.prompt = params.prompt.replace(/--newparam\s+\d+/i, '').trim();
  }

  return params;
}
```

2. **Update Workflow Generator**:
```javascript
static generateTextToImage(prompt, options = {}) {
  const {
    newParam = defaultValue,
    // ... other options ...
  } = options;

  // Use newParam in workflow
}
```

3. **Update Documentation**:
- Add to README.md parameter list
- Add example usage
- Update help panel in PromptInput component

## Adding New ComfyUI Nodes

To integrate new ComfyUI nodes:

1. **Study ComfyUI API**: Understand the node's inputs/outputs
2. **Update Workflow Generator**: Add node to workflow structure
3. **Test Workflow**: Verify in ComfyUI directly first
4. **Integrate**: Add to workflow generation logic
5. **Document**: Add usage examples

## Bug Reports

Good bug reports include:

- **Clear Title**: Describe the issue concisely
- **Steps to Reproduce**: List exact steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable
- **Error Messages**: Include full error logs

## Feature Requests

Good feature requests include:

- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other ways to solve the problem
- **Examples**: Similar features in other tools

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive environment

## Questions?

- Open an issue for questions
- Check existing issues first
- Provide context and details

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
