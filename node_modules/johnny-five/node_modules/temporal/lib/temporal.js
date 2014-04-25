"use strict";
/*
 * temporal
 * https://github.com/rwldrn/temporal
 *
 * Copyright (c) 2012 Rick Waldron
 * Licensed under the MIT license.
 */
var Emitter = require("events").EventEmitter,
  util = require("util"),
  exportable, queue, drift, priv;

require("es6-shim");

// All APIs will be added to `exportable`, which is lastly
// assigned as the value of module.exports
exportable = {};

// Object containing callback queues, keys are time in MS
queue = {};

// Initial value of time drift
// TODO: Implement drift adjustment algorithm
drift = 0;

// Task details are stored as a plain object, privately in a Map
// to avoid being forced to expose the properties directly on the instance.
//
// Queue emitters are stored privately in a Map to avoid using
// |this| alias patterns.
priv = new Map();

var tick = global.setImmediate || process.nextTick;

/**
 * Task create a temporal task item
 * @param {Object} entry Options for entry {time, task}
 */
function Task(entry) {
  if (!(this instanceof Task)) {
    return new Task(entry);
  }

  this.called = 0;
  this.now = this.calledAt = Date.now();

  priv.set(this, entry);

  // Side table property definitions
  entry.isRunnable = true;
  entry.later = this.now + entry.time;


  if (!queue[entry.later]) {
    queue[entry.later] = [];
  }

  // console.log( entry.later, this );
  queue[entry.later].push(this);
}

// Inherit EventEmitter API
util.inherits(Task, Emitter);

/**
 * Task.deriveOp (reduction)
 * (static)
 */
Task.deriveOp = function(p, v) {
  return v !== "task" ? v : p;
};


/**
 * stop Stop the current behaviour
 */
Task.prototype.stop = function() {
  priv.get(this).isRunnable = false;
  this.emit("stop");
};

function Queue(tasks) {
  priv.set(this, []);

  this.add(tasks);
}

util.inherits(Queue, Emitter);

Queue.prototype.stop = function() {
  priv.get(this).forEach(function(ref) {
    ref.stop();
  });

  this.emit("stop");
};

Queue.prototype.add = function(tasks) {
  var thisq = this;
  var op, item, task, ref, refs;

  this.cumulative = this.cumulative || 0;

  refs = priv.get(this);

  while (tasks.length) {
    item = tasks.shift();
    op = Object.keys(item).reduce(Task.deriveOp, "");
    // console.log( op, item[ op ] );
    this.cumulative += item[op];

    // For the last task, ensure that an "end" event is
    // emitted after the final callback is called.
    if (tasks.length === 0) {
      task = item.task;
      item.task = function(temporald) {
        task.call(thisq, temporald);

        // Emit the end event _from_ within the _last_ task
        // defined in the Queue tasks. Use the |tasks| array
        // object as the access key.
        thisq.emit("end", temporald);

        // Reset on last one in the queue
        thisq.cumulative = 0;
      };
    }

    if (op === "loop" && tasks.length === 0) {
      // When transitioning from a "delay" to a "loop", allow
      // the loop to iterate the amount of time given,
      // but still start at the correct offset.
      ref = exportable.delay(this.cumulative - item[op], function() {
        ref = exportable.loop(item[op], item.task);

        refs.push(ref);
      });
    } else {
      ref = exportable[op](this.cumulative, item.task);
    }

    refs.push(ref);
  }
};

exportable.queue = function(tasks) {
  return new Queue(tasks);
};


// For more information about this approach:
//
//    https://dl.dropbox.com/u/3531958/empirejs/index.html
//

var previousTick = Date.now();

tick(function processQueue() {
  var now, entry, entries, temporald;

  // Store entry stack key
  now = Date.now();

  // Derive entries stack from queue
  entries = queue[now] || [];
  for (var i = previousTick; i <= now; i++) {
    entries = queue[i] || [];
    if (entries.length) {
      break;
    }
  }
  previousTick = i;

  if (entries.length) {

    // console.log( now, entries );
    // console.log( entries );
    while (entries.length) {
      // Shift the entry out of the current list
      temporald = entries.shift();
      entry = priv.get(temporald);

      // Execute the entry's callback, with
      // "entry" as first arg
      if (entry.isRunnable) {
        temporald.called++;
        temporald.calledAt = now;
        entry.task.call(temporald, temporald);
      }

      // Additional "loop" handling
      if (entry.type === "loop" && entry.isRunnable) {

        // Calculate the next execution time
        entry.later = now + entry.time;

        // Create a queue entry if none exists
        if (!queue[entry.later]) {
          queue[entry.later] = [];
        }

        if (entry.isRunnable) {
          // Push the entry into the cue
          queue[entry.later].push(temporald);
        }
      }
    }

    // Delete the empty queue array
    delete queue[now];
  }

  tick(processQueue);
});

["loop", "delay"].forEach(function(type) {
  exportable[type] = function(time, task) {
    if (typeof time === "function") {
      task = time;
      time = 10;
    }
    return new Task({
      time: time,
      type: type,
      task: task
    });
  };
});

// Alias "delay" as "wait" or "defer" (back compat with old compulsive API)
// These aid only in user code that desires clarity in purpose.
// Certain practical applications might be suited to
// "defer" or "wait" vs. "delay"
//
exportable.wait = exportable.defer = exportable.delay;

exportable.repeat = function(n, ms, callback) {
  exportable.loop(ms, function(context) {
    callback(context);

    if (context.called === n) {
      this.stop();
    }
  });
};

exportable.clear = function() {
  queue = {};
};

module.exports = exportable;
