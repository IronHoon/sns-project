import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import styled from 'styled-components';
import PostBackup from 'views/kokkokme/components/timeline/PostBackup';
import PostDetail from 'types/socials/posts/PostDetail';
import { COLOR } from 'constants/COLOR';

const Container = styled(View)`
  align-items: center;
  border-top-color: ${COLOR.GRAY};
  border-top-style: solid;
  border-top-width: 1px;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  width: 100%;
`;

const Button = styled(View)`
  height: 20px;
  display: flex;
  background-color: gray;
  align-items: center;
  margin-bottom: 10px;
`;
interface Props {
  dummy: any;
}
interface IItem {
  item: PostDetail;
}

const TimelineBackup = ({ dummy }: Props) => {
  const [fullscreenProps, setFullscreenProps] = useState(false);

  const toggleFullscreen = (id: number) => {
    console.log('id', id);
    // setFullscreenProps(!fullscreenProps);

    // if (this.state.fullscreen) {
    //   Orientation.lockToLandscape();
    // } else {
    //   Orientation.unlockAllOrientations();
    // }
  };

  return (
    <>
      <Container>
        <FlatList
          data={dummy}
          renderItem={({ item }) => (
            <PostBackup
              fullscreen={fullscreenProps}
              key={item._id}
              toggleFullscreen={() => toggleFullscreen(item.id)}
              {...item}
            />
          )}
          style={fullscreenProps ? styles.fullscreen : styles.container}
        />
      </Container>
    </>
  );
};

export default TimelineBackup;

const styles = StyleSheet.create({
  container: {
    borderTopColor: '#ededed',
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    marginBottom: 40,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
