module.exports.simualte = (interval) => {
  function myFunc(arg) {
    console.log(`arg was => ${arg}`);
  }

  setInterval(myFunc, interval, 'funky');
}
