# plogging

Python style logging for Node.js

Node.js has a multitude of loggers, log handlers, log shippers, etc., etc., etc.. however there are people who know the Python logging library inside out, it'd be nice to do similar things in Node.

## Current state

plogging is a basic implementation of parts of the core API described here: http://docs.python.org/2/library/logging.html
I hope to extend the API further, making extensions rather than changes for anything that needs to become async.

There have been a couple of tweaks to the default log handler and formatter:
ConsoleHandler - Will output using console.{info,warn,error,log}
Formatter.prototype.color - set to false by default, set to true to introduce ANSI color to formatted strings based on field name and value (currently only record.lvl). This will be moved into a custom formatter at a later date.

## Examples

### Basic setup & root logger

```javascript
var logging = require('logging')
  , logger  = logging.getLogger();

var MyObject = { name: 'Greg' }

logger.log('info', 'My info log %s', MyObject.name);
logger.error('This thing broke here');
logger.warn('Oops, it\'s not quite broken... yet...');
```

### Enable color globally

```javascript
logging.Formatter.prototype.color = true;
```

### Use namespaces
```javascript
var logger_thing = logging.getLogger('thing')
  , logger_other_thing = logging.getLogger('other.thing');

logger_thing.info('info message');
logger_other_thing.setLevel('warn');
logger_other_thing.info('another info message');
logger_other_thing.info('warning');
```
