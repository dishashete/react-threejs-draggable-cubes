import React from 'react';

const Grid = ({ size, divisions }) => {
  return (
    <gridHelper args={[size, divisions]} />
  );
};

export default Grid;
