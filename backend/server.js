import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 NexusAI Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/tasks`);
  console.log(`   GET    http://localhost:${PORT}/api/tasks/stats`);
  console.log(`   GET    http://localhost:${PORT}/api/tasks/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/tasks`);
  console.log(`   PUT    http://localhost:${PORT}/api/tasks/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/tasks/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/tasks/:id/attachment`);
  console.log(`   DELETE http://localhost:${PORT}/api/tasks/:id/attachment`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
  console.log(`   POST   http://localhost:${PORT}/api/demo-requests`);
  console.log(`   GET    http://localhost:${PORT}/api/demo-requests\n`);
});
