import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IProfile } from "../../../../types/Profile";
import { EditIconBlack } from "../../../assets/icons";
import asset from "../../../assets/png";
import Title from "../../../components/text/Title";
import HeaderNavigation from "../../../navigation/HeaderNavigation";
import { RootStackParamList } from "../../../navigation/type";
import { ProfileService } from "../../../service/ProfileService";
import { QueryKey } from "../../../statics/constants/Querykey";
import { ScreenName } from "../../../statics/constants/ScreenName";
import { Colors } from "../../../styles/Colors";
import { emailRegex, nicknameRegex, pwRegex } from "../../../js/util";
import BottomModal from "../../../components/modal/BottomModal";
import { Control, Controller, FieldError, FieldValues, RegisterOptions, useForm } from "react-hook-form";
import { AuthModel } from "../../../model/AuthModel";
import axios from "axios";

const ProfileManagementScreen = () => {
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const imageBaseURL = "https://animores-image.s3.ap-northeast-2.amazonaws.com";

  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, ScreenName.ProfileManagement>
    >();

  const { control, handleSubmit, formState:{errors} } = useForm({ mode: "onChange"})
  const [nickname, setNickname] = useState<string>('');

  // Nickname 중복 확인 상태
  const [nicknameState, setNicknameState] = useState<AuthModel.INicknameModel["state"]>("none")

  const [isFirstVisible, setIsFirstVisible] = useState<boolean>(false);

  const { data: myProfileInfo } = useQuery({
    queryKey: [QueryKey.MY_PROFILE],
    queryFn: () => ProfileService.profile.myProfile(),
  });

  const { data: profileList } = useQuery({
    queryKey: [QueryKey.PROFILE_LIST],
    queryFn: () => ProfileService.profile.list(),
  });

  const myProfile = myProfileInfo?.data?.data;
  const profiles = Object.values(profileList?.data?.data) || [];

  if (profiles.length < 6) {
    profiles.push({
      id: "add",
      imageUrl: "",
      name: "",
    });
  }


  // Nickname - 입력 시
  const handleOnChangeNickname = (inputText:string) => {
    // 닉네임 재입력 시 인증 무효화
    setNicknameState("none")
    
    const matchNickname = inputText.match(nicknameRegex)

    // if (matchNickname === null) {
    //   setValidation({...validation, nickname: false})
    // } else {
    //   setValidation({...validation, nickname: true})
    // }
  }

  // Nickname - 중복확인 클릭 시
  const checkNickname = async (nickname: string) => {
    // 중복이면 
    await axios.get(`${baseURL}/api/v1/account/check-nickname/${nickname}`)
    .then((response) => {
      if (!response.data.data){
        setNicknameState('success');
      } else {
        // 중복일 경우
        setNicknameState('fail');
      }
    })
    .catch(function (error) {
        console.log("err: ", error);
        return { data: null, status: error || 500 };
    })
  }

  const handlePress = async (item: IProfile) => {
    if (item.id === "add") {
      navigation.navigate(ScreenName.CreateProfile);
    } else {
      navigation.navigate(ScreenName.EditProfile, { item });
    }
  };

  useEffect(() => {
    if (myProfile?.nickname) {
      setNickname(myProfile.nickname);
    }
  }, [myProfile]);

  //닉네임 변경 모달 footer
  const footerEditNickname = (): React.ReactNode => {
    return (
      <View style={styles.bottomModalContainer}>
        <View style={styles.footerTopLine} />
        <Controller
          name="nickname"              
          control={control}
          rules={{
            required: "닉네임을 입력해주세요.", 
            pattern: {
            value: nicknameRegex, // 닉네임 8자 이상이면 인증 안되는 오류
            message: "영문, 한글, 숫자만 가능하며 3~20자로 입력해주세요."
          }}}
          render={({ field: { onChange, onBlur, value }, fieldState: {error} }) => (
            <View style={[styles.inputWrap, { marginTop: 33 }]}>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <TextInput 
                  style={[styles.inputBox, error ? styles.errorUnderline : null]}
                  placeholder="닉네임을 입력해주세요" 
                  onChangeText={(value) => onChange(value) && handleOnChangeNickname(value)} 
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.inputButton]} 
                  disabled={error}
                  onPress={() => checkNickname(value)}
                >
                  <Text style={error && styles.textDisabled}>중복확인</Text>
                </Pressable>
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
              {value && nicknameState === 'fail' && <Text style={styles.errorText}>이미 사용중인 닉네임입니다.</Text>}
              {value && nicknameState === 'success' && <Text style={styles.successText}>사용하실 수 있는 닉네임입니다.</Text>}
            </View>
          )}
        />
        <View style={[styles.footer, { marginTop: 33 }]}>
          <Pressable
            onPress={() => {
              console.log("수정완료")
            }}
            style={styles.buttonContainer}
          >
            <Title
              text={"수정완료"}
              fontSize={16}
              color={Colors.White}
              style={{ textAlign: "center" }}
            />
          </Pressable>
        </View>
      </View>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderNavigation
          middletitle="프로필 관리"
          hasBackButton={true}
          onPressBackButton={() => navigation.goBack()}
        />
        <View style={styles.profileTitleContainer}>
          <View style={styles.profileTitle}>
            <Title
              text={"계정 기본 정보"}
              fontSize={16} />
          </View>
        </View>
        <View style={[styles.Row, { marginTop: 34 }]}>
          <Title
            text={"닉네임"}
            color={Colors.AEAEAE}
            style={styles.InfoTitle}
          />
          {/* TODO: 닉네임 변경 모달 열림 */}
          <Pressable
            style={styles.TextInputContainer}
            onPress={() => {
              setIsFirstVisible(true);
            }}
          >
            <Title 
              text={"닉네임"}
              fontSize={16}
              style={styles.input}
            />
            <EditIconBlack style={{ alignSelf: "center" }} />
          </Pressable>
        </View>
        <View style={[styles.Row, { marginTop: 20 }]}>
          <Title
            text={"이메일"}
            color={Colors.AEAEAE}
            style={styles.InfoTitle}
          />
          <View style={styles.TextInputContainer}>
            <Title
              text={myProfile?.email}
              fontSize={16} />
          </View>
        </View>
        <View style={[styles.Row, { marginTop: 20 }]}>
          <Title
            text={"비밀번호"}
            color={Colors.AEAEAE}
            style={styles.InfoTitle}
          />
          {/* TODO: 비밀번호 변경 페이지로 이동 */}
          <Pressable style={styles.TextInputContainer} onPress={() => navigation.navigate(ScreenName.UserVerification)}>
            <Title
              text={"•••••••••••••••"}
              fontSize={16}
              style={styles.input} 
            />
            <EditIconBlack style={{ alignSelf: "center" }} />
          </Pressable>
        </View>
        <View style={[styles.profileTitleContainer, { marginTop: 80 }]}>
          <View style={styles.profileTitle}>
            <Title
              text={"프로필 정보"}
              fontSize={16} />
          </View>
        </View>
        {profiles && (
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
            <View style={styles.profileGrid}>
              {profiles.map((item: IProfile) => {
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handlePress(item)}
                    style={styles.profileItem}
                  >
                    <Image
                      source={
                        item.id === "add"
                          ? asset.petAdd
                          : { uri: `${imageBaseURL}/${item.imageUrl}` }
                      }
                      style={styles.profileImage}
                    />
                    <Title text={item.id === "add" ? "프로필 추가" : item.name} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {/* 모달 */}
        <BottomModal
          isVisible={isFirstVisible}
          onClose={() => {
            setIsFirstVisible(false);
          }}
          footer={footerEditNickname}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  profileTitleContainer: {
    alignItems: "center",
    marginTop: 14,
  },
  profileTitle: {
    width: 238,
    borderWidth: 1,
    borderColor: Colors.F9F9FB,
    borderRadius: 99,
    alignItems: "center",
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.Black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        backgroundColor: Colors.F9F9FB,
        elevation: 4,
        shadowColor: "gray",
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 40,
  },
  profileItem: {
    alignItems: "center",
    marginBottom: 30,
    width: "50%",
  },
  profileImage: {
    width: 98,
    height: 98,
    borderRadius: 22,
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    top: 39,
    width: 24,
    height: 24,
  },
  input: {
    fontSize: 16,
    marginRight: 7,
    textDecorationLine: "underline",
  },
  InfoTitle: {
    flex: 1,
    textAlign: "right",
    marginRight: 40
  },
  TextInputContainer: {
    flexDirection: 'row',
    flex: 1.5
  },
  Row: {
    flexDirection: "row",
    alignItems: "center"
  },
  bottomModalContainer: {
    marginTop: 15,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  footerTopLine: {
    backgroundColor: Colors.Gray838383,
    height: 1.5,
    width: 50,
    alignSelf: "center",
  },
  inputWrap: {
    flexDirection: "column",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputBox: {
    flex: 1,
    height: 42,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFF",
    borderBottomColor: "#C1C1C1",
    borderBottomWidth: 1,
    fontSize: 14
  },
  inputButton: {
    backgroundColor: "#F2F2F2", 
    padding: 12, 
    borderRadius: 5, 
    marginStart: 10, 
    width: 104, 
    alignItems: "center",
  },
  textDisabled: {
    color: "#AEAEAE",
  },
  errorText: {
    color: "#FF4040",
  },
  successText: {
    color: '#00B01C',
  },
  buttonContainer: {
    backgroundColor: Colors.FB3F7E,
    flex: 1,
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
  },
});
