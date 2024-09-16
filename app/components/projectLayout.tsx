import React from 'react';
import Box from './box';

const items = [
  { name: 'Server 1', osType: 'Linux', ip: '192.168.1.1', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png', owner: 'Alice' },
  { name: 'Server 2', osType: 'Windows', ip: '192.168.1.2', image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Windows_logo_-_2012_%28dark_blue%29.svg', owner: 'Bob' },
  { name: 'Server 3', osType: 'Linux', ip: '192.168.1.3', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png', owner: 'Charlie' },
  { name: 'Server 4', osType: 'Windows', ip: '192.168.1.4', image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Windows_logo_-_2012_%28dark_blue%29.svg', owner: 'Dave' },
  // Add more items as needed
];

const ProjectLayout = () => {
  return (
    <div className="flex justify-center p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl w-full">
        {items.map((item, index) => (
          <Box key={index} name={item.name} osType={item.osType} ip={item.ip} image={item.image} owner={item.owner} />
        ))}
      </div>
    </div>
  );
};

export default ProjectLayout;
