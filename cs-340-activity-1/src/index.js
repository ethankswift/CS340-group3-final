const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { createViewContext } = require('./utils');
const gamesRouter = require('./routes/games');
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const schoolsRouter = require('./routes/schools');
const topRecordsRouter = require('./routes/top-records');
const personalStatsRouter = require('./routes/personal-stats');
const addPlayerRouter = require('./routes/add-player');

const config = require('./config');

const PORT = process.env.PORT || 3000;

// Create our application
const app = express();

// Set a location for express to serve static files from (CSS and JS)
app.use('/assets', express.static('assets'));

// Setup our view engine
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        ifeq: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Connect to the database on each request. The database connection will be available as `req.db`.
// The connection will automatically close when the object is destroyed.
app.use((req, res, next) => {
    let conn = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.dbname
    });
    conn.connect((err) => {
        if (err) return next(err);
        req.db = conn;
        next();
    });
});

// Add our routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(gamesRouter);
app.use(playersRouter);
app.use(teamsRouter);
app.use(schoolsRouter);
app.use(topRecordsRouter);
app.use(personalStatsRouter);
app.use(addPlayerRouter);

app.use('/help', (req, res) => {
    res.status(200);
    res.render('help', createViewContext());
});
// Add a handler to render a 404 view
app.use('*', (req, res) => {
    res.status(404);
    res.render('404', createViewContext());
});

// Add error handling
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.log(err);
    res.status(500);
    res.render('500', createViewContext());
});

// Start our server
app.listen(PORT, () => {
    console.log('Object Opposition League Server is listening on port ' + PORT);
});
