import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import StarRating from 'react-native-star-rating';

const StarWrap = styled.View`
  width: 100%;
  flex-direction: row;
`;
type Props = {
  starSize?: number;
  disabled?: boolean;
  count?: number;
};

const StarButton = ({ starSize = 40, disabled = false, count }: Props) => {
  const [starCount, setStarCount] = useState(0);

  const selectedStarHandler = (rating) => {
    if (!disabled && !count) setStarCount(rating);
  };
  useEffect(() => {
    if (disabled && count) setStarCount(count);
    //TODO : count 숫자는 잘받아오나 보이는 별이가끔 잘못나옴
    console.log(count);
  });

  return (
    <StarWrap>
      <StarRating
        disabled={false}
        emptyStar={require('assets/images/icon/img-star-off-40.png')}
        fullStar={require('assets/images/icon/img-star-on-40.png')}
        maxStars={5}
        rating={starCount}
        halfStarEnabled={false}
        selectedStar={(rating) => selectedStarHandler(rating)}
        starSize={starSize}
      />
    </StarWrap>
  );
};

export default StarButton;
