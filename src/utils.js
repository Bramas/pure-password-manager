


const idleEventListeners = [
  'load',
  'mousemove',
  'keypress',
  'mousedown',
  'touchstart',
  'click',
  'scroll',
  'resize',
  'wheel'
]
export const addIdleEvent = (cb, idleTimeout) => {
    var t;

    idleEventListeners.forEach((e) =>
      window.addEventListener(e, resetTimer, true)
    );

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(() => {
          idleEventListeners.forEach((e) =>
            window.removeEventListener(e, resetTimer, true)
          );
          cb()
        }, idleTimeout)
        // 1000 milisec = 1 sec
    }
};
