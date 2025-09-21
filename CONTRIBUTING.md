# Contributing to Ayurvedic Herb Traceability System

Thank you for your interest in contributing to the Ayurvedic Herb Traceability System! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows a code of conduct that we expect all contributors to adhere to:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be constructive in feedback and discussions
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ayurvedic-herb-traceability.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB
- Git
- IPFS (optional)

### Setup

1. Run the setup script:
   ```bash
   ./setup.sh
   ```

2. Or manually:
   ```bash
   # Install dependencies
   npm install
   cd server && npm install
   cd ../client && npm install
   
   # Setup environment
   cp env.example .env
   
   # Start services
   cd ../blockchain && ./start-network.sh
   cd ../server && npm run dev
   cd ../client && npm start
   ```

## Contributing Guidelines

### Types of Contributions

- **Bug Fixes**: Fix existing issues
- **Features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **Security**: Address security vulnerabilities

### Before Contributing

1. Check existing issues and pull requests
2. Discuss major changes in an issue first
3. Ensure your changes align with the project goals
4. Follow the coding standards

## Pull Request Process

### Before Submitting

1. **Test your changes**:
   ```bash
   # Run all tests
   npm test
   
   # Run specific test suites
   node tests/test-cases.js
   node tests/demo.js
   ```

2. **Check code quality**:
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   ```

3. **Update documentation** if needed

### Pull Request Template

When creating a pull request, please include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Screenshots**: If applicable
- **Breaking Changes**: Any breaking changes
- **Related Issues**: Link to related issues

### Review Process

1. All pull requests require review
2. Address feedback promptly
3. Keep pull requests focused and small
4. Update documentation as needed
5. Ensure all tests pass

## Issue Reporting

### Before Creating an Issue

1. Search existing issues
2. Check if it's already fixed in the latest version
3. Ensure it's a valid issue

### Issue Template

When creating an issue, please include:

- **Bug Report**:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details
  - Screenshots if applicable

- **Feature Request**:
  - Clear description
  - Use case and motivation
  - Proposed solution
  - Alternatives considered

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Handle errors appropriately

```javascript
// Good
const createHerbBatch = async (batchData) => {
  try {
    const result = await api.post('/batches', batchData);
    return result.data;
  } catch (error) {
    logger.error('Failed to create batch:', error);
    throw new Error('Batch creation failed');
  }
};

// Bad
const create = async (data) => {
  const result = await api.post('/batches', data);
  return result.data;
};
```

### React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript when possible
- Keep components small and focused

```jsx
// Good
const HerbBatch = ({ batch, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate(batch.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="herb-batch">
      {/* Component content */}
    </div>
  );
};

// Bad
const HerbBatch = (props) => {
  return <div>{props.batch.name}</div>;
};
```

### Go (Smart Contracts)

- Follow Go conventions
- Use meaningful names
- Add comments for exported functions
- Handle errors properly

```go
// CreateHerbBatch creates a new herb batch
func (s *HerbTraceabilityContract) CreateHerbBatch(
    ctx contractapi.TransactionContextInterface,
    batchID, species, farmerID string,
    quantity float64,
    unit string,
    latitude, longitude float64,
    address string,
) error {
    // Implementation
}
```

## Testing

### Test Requirements

- All new features must have tests
- Bug fixes must include regression tests
- Maintain or improve test coverage
- Write meaningful test cases

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── demo.js        # Demonstration script
└── test-cases.js  # Comprehensive test suite
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- tests/unit/batch.test.js

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Writing Tests

```javascript
// Good test example
describe('HerbBatch API', () => {
  it('should create a new batch with valid data', async () => {
    const batchData = {
      batchId: 'TEST_001',
      species: 'Ashwagandha',
      quantity: 100,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore'
    };

    const response = await batchesAPI.createBatch(batchData);
    
    expect(response.data.success).toBe(true);
    expect(response.data.data.batchId).toBe('TEST_001');
  });

  it('should reject batch with invalid coordinates', async () => {
    const invalidBatchData = {
      batchId: 'TEST_002',
      species: 'Ashwagandha',
      quantity: 100,
      unit: 'kg',
      latitude: 200, // Invalid latitude
      longitude: 77.5946,
      address: 'Test Farm'
    };

    await expect(batchesAPI.createBatch(invalidBatchData))
      .rejects.toThrow('Invalid coordinates');
  });
});
```

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

### Documentation Structure

```
docs/
├── api.md          # API documentation
├── setup.md        # Setup instructions
├── architecture.md # System architecture
├── deployment.md   # Deployment guide
└── contributing.md # This file
```

### Writing Documentation

- Use clear headings and structure
- Include code examples
- Add diagrams when helpful
- Keep it concise but complete

```markdown
## Creating a Herb Batch

To create a new herb batch, use the `POST /api/batches` endpoint:

```javascript
const batchData = {
  batchId: 'ASHWAGANDHA_2024_001',
  species: 'Ashwagandha',
  quantity: 100,
  unit: 'kg',
  latitude: 12.9716,
  longitude: 77.5946,
  address: 'Green Valley Farms, Bangalore'
};

const response = await fetch('/api/batches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(batchData)
});
```

**Parameters:**
- `batchId` (string, required): Unique batch identifier
- `species` (string, required): Herb species name
- `quantity` (number, required): Harvest quantity
- `unit` (string, required): Quantity unit (kg, g, lb, etc.)
- `latitude` (number, required): Harvest location latitude
- `longitude` (number, required): Harvest location longitude
- `address` (string, required): Complete harvest address
```

## Commit Guidelines

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(auth): add JWT token refresh functionality

fix(batch): resolve GPS coordinate validation issue

docs(api): update batch creation endpoint documentation

test(compliance): add compliance check test cases
```

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## Getting Help

- **Documentation**: Check the docs/ directory
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to the Ayurvedic Herb Traceability System! 🌿
