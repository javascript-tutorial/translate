let app = require('../app');

app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
