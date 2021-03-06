import _ from 'lodash';

const findAudioElem = () => Array.prototype.find.call(document.querySelectorAll('audio'), (elem) => !!elem.src);

Emitter.on('audiooutput:fetch', () => {
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      Emitter.fireAtAll('audiooutput:list', _.transform(devices, (final, device) => {
        final.push({
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind,
        });
      }, []));
    });
});

export const setAudioDevice = (id, count = 0) =>
  new Promise((resolve, reject) => {
    findAudioElem().setSinkId(id)
      .then(() => { resolve(); })
      .catch((oops) => { if (count > 10000) { reject(oops); } else { setAudioDevice(id, count + 1).then(resolve).catch((err) => reject(err)); } }); // eslint-disable-line
  });

Emitter.on('audiooutput:set', (event, deviceId) => {
  let once = true;
  if (findAudioElem().paused) {
    findAudioElem().addEventListener('playing', () => {
      if (!once) return;
      once = false;
      setAudioDevice(deviceId);
    });
  } else {
    setAudioDevice(deviceId);
  }
});
