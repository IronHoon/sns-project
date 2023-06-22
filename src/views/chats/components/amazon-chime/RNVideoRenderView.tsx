//@ts-nocheck
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import MySetting from 'MySetting';
import PropTypes from 'prop-types';
import React, { createRef } from 'react';
import { requireNativeComponent, findNodeHandle } from 'react-native';
import { NativeFunction } from 'utils/calls/AmazonChimeNativeBridge';
import LogUtil from 'utils/LogUtil';

// 중요한 컴포넌트! Wrapper for the video tile UI component.
type RNVideoRenderViewProps = {
  tileId: number;
  isOnTop: boolean;
  mirror: boolean;
  width: string | number;
  height: string | number;
};
class RNVideoRenderView extends React.Component<RNVideoRenderViewProps, any> {
  countRef = createRef<number>(0);

  bind() {
    if (MySetting.isIos) {
      LogUtil.info(`RNVideoRenderView tileId:${this.props.tileId}, bind count:${this.countRef.current}`);
      setTimeout(() => {
        try {
          const viewId = findNodeHandle(this);
          if (viewId && viewId !== null) {
            NativeFunction.bindVideoView(viewId, this.props.tileId);
          }
        } catch (e) {}

        this.countRef.current += 1;
        if (this.countRef.current <= 5) {
          this.bind();
        }
      }, 200);
    }
  }

  unbind() {
    if (MySetting.isIos) {
      LogUtil.info(`RNVideoRenderView tileId:${this.props.tileId}, unbind`);
      try {
        NativeFunction.unbindVideoView(this.props.tileId);
      } catch (e) {}
    }
  }

  componentDidMount() {
    LogUtil.info('RNVideoRenderView componentDidMount', [this.props.tileId]);
    // 우리는 비디오 바인드하는데 딜레이를 줘야한다.
    // 왜냐하면 초기 렌더링이 발생하고 즉시, componentDidMount는 불릴 것이다.
    // 이것은 RCTUIManager가 해당 VideoView를 추가하기 *전*입니다. (ios는 네이티브의 viewForReactTag()가 View를 돌려줄것이다, android는 그걸 못하니깐, @ReactProp(name = "tileId") 활용)
    // 그래서, 우리는 이 함수가 완료된 이후에, bindVideoView를 발생시킬 필요가 있다.

    this.bind();
  }

  componentWillUnmount() {
    LogUtil.info('RNVideoRenderView componentWillUnmount', [this.props.tileId]);
    this.unbind();
  }

  render() {
    return (
      <RNVideoRenderViewNative
        {...this.props}
        style={{
          width: MySetting.isIos ? this.props.width : '100%',
          height: MySetting.isIos ? this.props.height : '100%',
          resizeMode: MySetting.isIos ? undefined : 'fill',
          overflow: 'hidden',
          ...this.props.style,
        }}
      />
    );
  }
}

RNVideoRenderView.propTypes = {
  /**
   * A int value to identifier the Video view, will be used to bind video stream later
   */
  tileId: PropTypes.number,
  isOnTop: PropTypes.bool,
  mirror: PropTypes.bool,
};

var RNVideoRenderViewNative = requireNativeComponent('RNVideoView');

export default RNVideoRenderView;
