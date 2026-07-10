import { fileTypeFromStream } from 'file-type';
import { Readable } from 'node:stream';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const scdlModule = require('../');
const scdl = scdlModule.default || scdlModule;

async function checkDownload() {
  try {
    console.log('SCDL Module:', scdl);
    
    const stream = await scdl.download(
      'https://soundcloud.com/monsune_inc/outta-my-mind', 
      process.env.CLIENT_ID
    );

    stream.on('error', err => {
      console.error('Stream error:', err);
      process.exit(1);
    });

    const webStream = Readable.toWeb(stream);

    const type = await fileTypeFromStream(webStream);

    const allowedMimeTypes = ['audio/mpeg', 'video/mp4', 'audio/mp4', 'audio/x-m4a'];

    if (!type || !allowedMimeTypes.includes(type.mime)) {
      console.log('Invalid file type: ' + (type ? type.mime : 'unknown'));
      process.exit(1);
    }

    console.log('Success running download-check');
    process.exit(0);

  } catch (err) {
    console.error('Download failed:', err);
    process.exit(1);
  }
}

checkDownload();