import app from './app';
import { env } from './utils/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api/v1`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
