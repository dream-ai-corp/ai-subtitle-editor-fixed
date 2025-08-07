# Custom Code Strategy: The Correct Approach

## The Problem We Solved

You were absolutely right to question the submodule branch approach! Having project-specific changes in submodule branches creates chaos:

### ❌ Wrong Approach (Submodule Branches)
```
Template Repo:
├── main (template code)
├── project-a-custom (project A changes)
├── project-b-custom (project B changes)
└── project-c-custom (project C changes)
```

**Problems:**
- Template repositories become cluttered
- Updates become very difficult
- Multiple projects create branch conflicts
- Template maintainers have to manage project-specific code

## ✅ Correct Approach: Project-Level Custom Code

### How It Works

```
AI-Subtitle-Editor-2/
├── frontend/                    # Clean template submodule
│   ├── src/
│   │   ├── app/                # Template code (never modify)
│   │   ├── template/           # Template code (never modify)
│   │   └── custom/             # Symlinks to project custom code
│   └── ...
├── userManagementBackend/       # Clean template submodule
│   ├── template/               # Template code (never modify)
│   ├── app/                    # Template code (never modify)
│   └── custom/                 # Symlinks to project custom code
├── custom/                     # Project-specific code (tracked in main repo)
│   ├── frontend/
│   │   ├── components/         # Custom Vue components
│   │   ├── pages/             # Custom pages
│   │   ├── stores/            # Custom Pinia stores
│   │   └── ...
│   └── backend/
│       ├── models/            # Custom Django models
│       ├── views/             # Custom Django views
│       └── ...
└── scripts/
    └── integrate-custom-code.sh  # Integration script
```

## Benefits

### ✅ Clean Templates
- Template repositories stay focused on template code only
- No project-specific branches or modifications
- Easy to maintain and update templates

### ✅ Project Isolation
- Each project has its own `custom/` directory
- Custom code is tracked in the main project repository
- No conflicts between different projects

### ✅ Easy Updates
- Template updates don't affect custom code
- Custom code remains unchanged during template updates
- Simple integration process

### ✅ Scalability
- Works for any number of projects
- Each project can have completely different custom code
- No impact on other projects using the same templates

## How to Use

### 1. Add Custom Code
```bash
# Add custom frontend component
touch custom/frontend/components/MyCustomComponent.vue

# Add custom backend model
touch custom/backend/models/MyCustomModel.py
```

### 2. Integrate Custom Code
```bash
# Run integration script to create symlinks
./scripts/integrate-custom-code.sh

# Or integrate specific parts
./scripts/integrate-custom-code.sh frontend
./scripts/integrate-custom-code.sh backend
```

### 3. Update Templates
```bash
# Update template submodules
./scripts/integrate-custom-code.sh update

# Your custom code remains unchanged!
```

## Example Workflow

### Creating a New Project
```bash
# 1. Clone the full-stack template
git clone git@github.com-Code-Czar:Code-Czar/Full-Stack-Template.git my-new-project
cd my-new-project

# 2. Initialize submodules
git submodule update --init --recursive

# 3. Set up custom code structure
mkdir -p custom/{frontend,backend}/{components,models,utils}

# 4. Add your custom code
# ... create your custom components, models, etc.

# 5. Integrate custom code
./scripts/integrate-custom-code.sh

# 6. Start development!
```

### Updating Templates
```bash
# 1. Update template submodules
./scripts/integrate-custom-code.sh update

# 2. Your custom code is automatically preserved
# 3. Test that everything still works
# 4. Commit any necessary adjustments
```

## File Structure Examples

### Frontend Custom Component
```vue
<!-- custom/frontend/components/SubtitleEditor.vue -->
<template>
  <div class="subtitle-editor">
    <h2>AI Subtitle Editor</h2>
    <!-- Your custom component code -->
  </div>
</template>

<script setup lang="ts">
// Your custom logic
</script>
```

### Backend Custom Model
```python
# custom/backend/models.py
from django.db import models

class SubtitleProject(models.Model):
    name = models.CharField(max_length=255)
    # Your custom model fields
```

## Integration Script Features

The `scripts/integrate-custom-code.sh` script provides:

- **Automatic symlink creation** between custom code and submodules
- **Template updates** with `./scripts/integrate-custom-code.sh update`
- **Selective integration** (frontend only, backend only, or both)
- **Error handling** and colored output
- **Clean separation** between template and custom code

## Best Practices

1. **Never modify template files** in `frontend/src/app/`, `frontend/src/template/`, `userManagementBackend/template/`, or `userManagementBackend/app/`

2. **Always add custom code** in the `custom/` directory

3. **Use descriptive names** for custom components and models

4. **Run integration script** after adding new custom code

5. **Test thoroughly** after template updates

6. **Document your custom code** well

## Conclusion

This approach gives you the best of both worlds:
- **Clean, maintainable templates** that can be easily updated
- **Project-specific custom code** that doesn't interfere with templates
- **Scalable solution** that works for any number of projects
- **Simple workflow** for development and updates

Your custom code stays with your project, while template improvements benefit all projects using the templates! 🚀