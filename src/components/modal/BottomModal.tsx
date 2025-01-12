import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle, Dimensions } from "react-native";
import Modal, { Direction } from "react-native-modal";
import { Colors } from "../../styles/Colors";
import Title from "../text/Title";

interface IProps {
  isVisible: boolean;
  propagateSwipe?: boolean;
  onClose?: () => void;
  onModalShow?: () => void;
  onModalHide?: () => void;
  swipeDirection?: Direction | Direction[];
  BottomText?: string;
  style?: StyleProp<ViewStyle>;
  footer?: () => React.ReactNode;

  // 중첩 모달
  _isVisible?: boolean;
  _onClose?: () => void;
  _title?: string;
  _subTitle?: string;
  _onDelete?: () => void;
}

const width = Dimensions.get("window").width;

const BottomModal: React.FunctionComponent<IProps> = (props: IProps) => {
  const {
    isVisible,
    propagateSwipe = true,
    onClose,
    onModalShow,
    onModalHide,
    swipeDirection = "down",
    BottomText,
    style,
    footer,
    _isVisible,
    _onClose,
    _title,
    _subTitle,
    _onDelete,
  } = props;

  return (
    <Modal
      isVisible={isVisible}
      propagateSwipe={propagateSwipe}
      swipeDirection={swipeDirection}
      onBackdropPress={onClose}
      onModalShow={onModalShow}
      onModalHide={onModalHide}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      backdropOpacity={0.6}
      style={[style, styles.modalStyle]}
    >
      <View style={styles.modalContainer}>
        {footer && footer()}
        {/* 프로필 이미지: 기본 이미지로 할래요 */}
        {BottomText &&
          <Pressable>
            <Title
              text={BottomText}
              color={Colors.AEAEAE}
              style={styles.basicTitle}
            />
          </Pressable>
        }
      </View>

      {_isVisible !== null && (
        <Modal
          transparent={true}
          isVisible={_isVisible}
          animationType="fade"
          onRequestClose={_onClose}
        >
          <View style={styles.innerModalContainer}>
            <Title
              text={_title}
              fontSize={16}
              fontWeight="bold"
              style={styles.modalText}
            />
            <Title
              text={_subTitle}
              fontSize={14}
              color={Colors.AEAEAE}
              style={styles.innerModalSubText}
            />
            <Pressable style={styles.innerPressableButton} onPress={_onDelete}>
              <Title text="삭제" color={Colors.FF4040} fontSize={15} />
            </Pressable>
            <View style={styles.innerLine} />
            <Pressable style={styles.innerPressableButton} onPress={_onClose}>
              <Title text="취소" fontSize={15} />
            </Pressable>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default BottomModal;

const styles = StyleSheet.create({
  modalStyle: {
    width: "100%",
    margin: "auto",
    justifyContent: "flex-end"
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Colors.White,
    paddingBottom: 30,
  },
  basicTitle: {
    textAlign: "center",
    marginTop: 36,
    textDecorationLine: "underline"
  },

  // 중첩 모달
  innerModalContainer: {
    paddingTop: 44,
    paddingBottom: 17,
    backgroundColor: Colors.White,
    borderRadius: 10,
    alignItems: "center",
  },
  innerModalText: {
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  innerModalSubText: {
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  innerLine: {
    height: 1,
    width: width - 80,
    borderWidth: 0.8,
    borderColor: Colors.DBDBDB,
  },
  innerPressableButton: {
    paddingVertical: 16,
    width: width - 80,
    alignItems: "center",
  },
});
