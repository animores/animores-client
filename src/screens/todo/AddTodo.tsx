import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, Text, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../styles/Colors";
import HeaderNavigation from "../../navigation/HeaderNavigation";
import { RootStackParamList } from "../../navigation/type";
import { ScreenName } from "../../statics/constants/ScreenName";
import { ScrollView, Switch, TextInput } from "react-native-gesture-handler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../statics/constants/Querykey";
import Title from "../../components/text/Title";
import ToDoType from "../../statics/constants/ToDoType";
import { Controller, Form, FormProvider, set, useController, useFieldArray, useForm } from "react-hook-form";
import { commonStyles } from "../../styles/commonStyles";
import { AlarmIcon, PaletteIcon, RepeatIcon, RightArrow, ScheduleIcon } from "../../assets/svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomModal from "../../components/modal/BottomModal";
import ToDoColors from "../../statics/constants/ToDoColors";
import { IAddTodo, RepeatUnit, WeekDay } from "../../../types/AddToDo";
import ColorPicker from 'react-native-wheel-color-picker';
import { PetService } from "../../service/PetService";
import { ToDoService } from "../../service/ToDoService";
import Toast from "react-native-toast-message";
import axios from "axios";

type AddToDoRouterProp = RouteProp<RootStackParamList, ScreenName.AddTodo>;

const AddTodo = ({ route }: { route: AddToDoRouterProp }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, ScreenName.AddTodo>>();  
  const methods = useForm<IAddTodo>({
    defaultValues: {
      profileId: 1,
      petIds: [],
      content: '',
      tag: null,
      date: '',
      time: '',
      isAllDay: false,
      color: ToDoColors.ORANGE,
      isUsingAlarm: false,
      repeat: null,
    }
  })

  const { control, handleSubmit, setValue, getValues, watch} = methods;  
  //펫 정보 불러오기
  const { data: petData } = useQuery({
    queryKey: [QueryKey.PET_LIST],
    queryFn: () => PetService.pet.list(),
  });

  interface IPet {
    id: number;
    name: string;
    isPressed: boolean;
  }
  const [pets, setPets] = useState<IPet[]>([]);
  
  // 펫 정보에다가 isPressed 추가
  useEffect(() => {
    if (petData?.data?.data) {
      setPets(
        petData.data.data.map(({ id, name }: { id: number, name: string }) => ({
          id,
          name,
          isPressed: false,
        }))
      );
    }
  }, [petData]);

  const [date, setDate] = useState<Date>(new Date());
  // 현재 날짜와 시간을 형식에 맞춰 date, time 에 넣어주기
  useEffect(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    setValue('date',(`${year}-${month}-${day}`));
    setValue('time',(`${hour}:${minute}`));
  }, [date]);
  
  // 시간을 오전/오후로 나누어 표시해주는 함수
  const timeStringConverter = (time: string): string => {
    const [hour, minute] = time.split(':');
    const hourNum = Number(hour);
    const minuteNum = Number(minute);
    if (hourNum < 12) {
      return `오전 ${String(hourNum).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')}`;
    }
    return `오후 ${String(hourNum-12).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')}`;
  }

  // 펫 선택시 해당 id 의 isPressed 값 변경 & petIds 에 id list 넣어주기
  const handlePetPress = useCallback(
    (id: number) => {
      setPets((prevPets) => {
        const updatedPets = prevPets.map((pet) =>
          pet.id === id ? { ...pet, isPressed: !pet.isPressed } : pet
        );
        const clickedPetsId = updatedPets.filter((pet) => pet.isPressed).map((pet) => pet.id);
        setValue('petIds', clickedPetsId);
        return updatedPets;
      });
    },[]);

  const isAllDay = watch('isAllDay');
  
  const Separator = useMemo(
    () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.separator} />
      </View>
    ),[]);

  // time picker modal 관련
  const [timePickerMode, setTimePickerMode] = useState<string>('date');
  const [timePickerSelected, setTimePickerSelected] = useState<boolean>(false);

  // tag modal 관련
  const [tagWindowSelected, setTagWindowSelected] = useState<boolean>(false);
  const selectedTag = watch('tag');
  const footerTag = useMemo(() => {
    return (
      <View style={styles.bottomModalContainer}>
        <View style={styles.footerTopLine} />
        <View style={styles.footerTagContainer}>
          {Object.values(ToDoType).map((tag) => (
            <Pressable
              key={tag}
              style={[
                styles.tagContainer,
                tag == getValues('tag') ? styles.selectedTag : styles.notSelectedTag,
              ]}
              onPress={() => {
                setValue('tag', tag);
                setValue('content', null);
                setTagWindowSelected((prev) => !prev);
              }}
            >
              <Text style={tag == getValues('tag') ? { color: 'white' } : { color: Colors.Pink }}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }, [selectedTag]);

  // color picker modal 관련
  const [colorWindowSelected, setColorWindowSelected] = useState<boolean>(false);
  const [colorPickerWindowSelected, setColorPickerWindowSelected] = useState<boolean>(false);
  const [useCustomColor, setUseCustomColor] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<string>('#aabbcc');
  const ColorPickerModal = useMemo((): React.ReactNode => {
    return (
      <Modal visible={colorPickerWindowSelected}>
        <View style={styles.colorSectionContainer}>
          <ColorPicker
            color={customColor}
            onColorChange={(color) => setCustomColor(color)}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
          />
          <Pressable onPress={() => setColorPickerWindowSelected(false)}>
            <Title text="취소" color={Colors.Pink}/>
          </Pressable>
          <Pressable onPress={() => {
            setColorPickerWindowSelected(false);
            setUseCustomColor(true);
            setValue('color', customColor);
            setColorWindowSelected(false);
          }}>
            <Title text="확인" color={Colors.Pink}/>
          </Pressable>
        </View>
      </Modal>
    )
  },[colorPickerWindowSelected, customColor]);

  // color picker modal footer 관련
  // custom color 선택시 color picker modal 띄우기
  const color = watch('color');
  const footerColor = useMemo(() => {
    return (
      <View style={styles.bottomModalContainer}>
        <View style={styles.footerTopLine} />
        <View style={styles.footerCircleContainer}>
          {Object.values(ToDoColors).map((color) => (
            <View
              key={color}
              style={{
                ...styles.footerOuterCircle,
                borderColor: color == getValues('color') ? 'black' : 'white',
              }}
            >
              <Pressable
                style={{ ...styles.footerColorCircle, backgroundColor: color }}
                onPress={() => {
                  setValue('color', color);
                  setColorWindowSelected((prev) => !prev);
                  setUseCustomColor(false);
                }}
              >
                {color == getValues('color') && <Text>✔</Text>}
              </Pressable>
            </View>
          ))}
          <View
            style={{
              ...styles.footerOuterCircle,
              borderStyle: useCustomColor ? 'solid' : 'dashed',
              borderColor: 'black' ,
            }}
          >
            <Pressable
              style={{ ...styles.footerColorCircle, backgroundColor: useCustomColor ? getValues('color') : Colors.White }}
              onPress={() => {
                setColorPickerWindowSelected(true);
              }}
            >
              {useCustomColor ? <Text>✔</Text> : <Text>+</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }, [color, useCustomColor]);

  // repeat modal 관련
  const [repeatWindowSelected, setRepeatWindowSelected] = useState<boolean>(false);
  const RadioButton = (props : {isClicked:boolean}) => {
    const {isClicked} = props;
    return (
      <View style={styles.radioOuterCircle}>
        {isClicked &&<View style={styles.radioInnerCircle}/> }
      </View>
    )
  }
  const repeat = watch('repeat');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(repeat == null ? null : repeat.unit);
  const [intervalValue, setIntervalValue] = useState<number>(repeat == null ? 1 : repeat.interval);
  const [weekDays, setWeekDays] = useState<WeekDay[]>(repeat == null ? [] : repeat.weekDays); 
  const [weekDayList, setWeekDayList] = useState<{day: WeekDay, isClicked: boolean}[]>(Object.values(WeekDay).map((day) => ({day, isClicked: false})));
  const footerRepeat = useMemo((): React.ReactNode => {
    const handleWeekDayPress = (day: WeekDay) => {
      setWeekDayList((prevWeekDayList) => {
        const updatedWeekDayList = prevWeekDayList.map((weekDay) =>
          weekDay.day === day ? { ...weekDay, isClicked: !weekDay.isClicked } : weekDay
        );
        const clickedWeekDays = updatedWeekDayList.filter((weekDay) => weekDay.isClicked).map((weekDay) => weekDay.day);
        setWeekDays(clickedWeekDays);
        return updatedWeekDayList;
      });
    };

    return (
      <View style={styles.bottomModalContainer}>
        <View style={styles.footerTopLine} />
        <View style={styles.footerRepeatContainer}>
          <Pressable  style={{...styles.footerRepeatLineContainer, backgroundColor: selectedUnit == null ? '#F4F4F4': Colors.White}} onPress={() => setSelectedUnit(null)}>
            <RadioButton isClicked={selectedUnit == null}/>
            <Text>반복 없음</Text>
          </Pressable>
          {Object.entries(RepeatUnit).map(([key, unit]) => (
            <>
              {selectedUnit === key ?
              <>
                <View style={{...styles.footerRepeatLineContainer, backgroundColor: '#F4F4F4'}} key={key} >
                  <RadioButton isClicked={true}/>
                  <TextInput 
                    value={intervalValue.toString()} 
                    onChangeText={(text) => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      const value = filteredText === '' ? 0 : Number(filteredText);
                      setIntervalValue(value);
                    }}
                  />
                  <Text>{unit.intervalText}</Text>
                </View>
                {key === 'WEEK' && <View style={{...styles.footerRepeatLineContainer, justifyContent: 'center'}}>
                    {Object.values(weekDayList).map(({day,isClicked}) => (
                      <Pressable style={{...styles.footerRepeatWeekDayContainer, borderColor: isClicked ? Colors.White: Colors.Pink, backgroundColor: isClicked ? Colors.Pink : Colors.White}} onPress={() => handleWeekDayPress(day)}>
                        <Text style={{color: isClicked ? Colors.White: Colors.Pink}}>{day}</Text>
                      </Pressable>
                    ))}
                    </View>}
              </>
              :
              <Pressable style={{...styles.footerRepeatLineContainer}} key={key} onPress={() => {
                setSelectedUnit(key);
                setIntervalValue(1);
                setWeekDays([]);
                setWeekDayList(Object.values(WeekDay).map((day) => ({day, isClicked: false})));
                }}>
                <RadioButton isClicked={false}/>
                <Text>{unit.display}</Text>
              </Pressable>
              }
            </>
        ))}
          <View style={{...styles.footerRepeatLineContainer, justifyContent: 'space-between', marginTop: 30}}>
            <Pressable style={styles.footerRepeatButton} onPress={() => setRepeatWindowSelected(false)}>
              <Text style={{color: "white"}}>취소</Text>
            </Pressable>
            <Pressable style={styles.footerRepeatButton} onPress={() => {
              if(selectedUnit != null) {
                setValue('repeat', {unit: selectedUnit, interval: intervalValue, weekDays: weekDays});
              } else {
                setValue('repeat', null);
              }
              setRepeatWindowSelected(false);
            }}>
              <Text style={{color: "white"}}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  },[repeat, selectedUnit, intervalValue, weekDays, weekDayList]);

  const repeatText = repeat ? `${repeat.interval}${RepeatUnit[repeat.unit].intervalText} ${repeat.weekDays} ` : '';

  const { todo } = route.params;
  const { isLoading: toDoLoading, data: originToDoData} = useQuery({
    queryKey: [QueryKey.TODO_ITEM, todo],
    queryFn: () => todo ? ToDoService.todo.get(todo) : Promise.resolve(null),
    enabled: !!todo,
  });

  useEffect(() => {
    if (toDoLoading) {
      return;
    }
    
    if (originToDoData?.data?.data) {
      const {color, date, id, intervalNum, isAllDay, isUsingAlarm, pets, time, title, unit, weekDays} = originToDoData.data.data;
      Object.values(ToDoType).includes(title) ? methods.setValue('tag', title) : methods.setValue('content', title);
      const petIds = pets.map((pet: { id: number; }) => pet.id);
      methods.setValue('profileId', 1);
      methods.setValue('petIds', petIds);
      methods.setValue('date', date);
      methods.setValue('time', time);
      methods.setValue('isAllDay', isAllDay);
      methods.setValue('color', color);
      methods.setValue('isUsingAlarm', isUsingAlarm);
      methods.setValue('repeat', unit ? {unit, interval: intervalNum, weekDays} : null);
      petIds.forEach((petId: number) => handlePetPress(petId));
      
    }
  },[toDoLoading]) 

  const onSubmit = (data: IAddTodo) => {
    var isError = false;
    var errorMessage = '';

    if (data.tag == null && data.content == null) {
      errorMessage = '할 일을 입력해주세요';
      isError = true;
    }

    if (data.petIds.length === 0) {
      errorMessage = '펫을 선택해주세요';
      isError = true;
      
    }

    if (isError) {
      Toast.show({
        type: 'error',
        text1: errorMessage,
      })
      return;
    }
    
    todo ? update(data) :mutate(data);
    navigation.goBack();
  };

  const { mutate, isLoading: createLoading } = useMutation({
    mutationFn: (data: IAddTodo) => ToDoService.todo.create(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '일정이 추가되었습니다',
      })
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        if (error.response) {
          Toast.show({
            type: 'error',
            text1: error.response.data.error.message,
          })
        }
      }
    }
  });

  const { mutate: update, isLoading: updateLoading } = useMutation({
    mutationFn: (data: IAddTodo) => {
      if (typeof todo === 'number') {
        return ToDoService.todo.update(todo, data);
      }
      throw new Error('Invalid todo id');
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '일정이 수정되었습니다',
      })
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        if (error.response) {
          Toast.show({
            type: 'error',
            text1: error.response.data.error.message,
          })
        }
      }
    }
  });

  const isLoading = todo ? updateLoading : createLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HeaderNavigation
          middletitle={todo ? "일정 수정" :"일정 추가"}
          rightTitle="완료"
          hasBackButton={true}
          onPressBackButton={() => {
              navigation.goBack();
            }}
          onPressRightButton={handleSubmit(onSubmit)}
          buttonDisabled={isLoading}
        />
        <FormProvider {...methods}>
          <View style={[commonStyles.container, {backgroundColor:"white"}]}>
            <View style={[styles.inputWrap, { marginTop: 20 }]}>
              <Text style={styles.label}>펫 선택</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelectContainer}>
                {pets.map(({ id, name, isPressed }) => (
                  <Pressable key={id} onPress={() => handlePetPress(id)}>
                    <View style={[styles.pet,  isPressed ? styles.selectedPet : styles.notSelectedPet]}>
                      <Text style={{color: isPressed? Colors.White : Colors.Pink}}>{name}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>할 일</Text>
              <View style={styles.toDoTitleContainer}>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      selectedTag != null ? 
                      <>
                      <Pressable style={{"paddingRight": 200}} onPress={() => {
                        setValue('tag', null);
                      }}>
                        <Text>{getValues('tag')}</Text>
                      </Pressable>
                      <Pressable style={[styles.tagContainer, styles.selectedTag]} onPress={() => setTagWindowSelected(true)}>
                        <Text style={{color:Colors.White}}>태그</Text>
                      </Pressable>
                      </> :   
                      <>
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          onChange(text);
                          setValue('tag', null);
                        }}
                        placeholder="태그 선택 또는 직접 입력"
                        value={value || ''}
                      />
                      <Pressable style={[styles.tagContainer, styles.notSelectedTag]} onPress={() => setTagWindowSelected(true)}>
                        <Text style={{color: Colors.Pink}}>태그</Text>
                      </Pressable>
                      </>
                    )}
                    name="content"
                  />
                <BottomModal
                isVisible={tagWindowSelected}
                onClose={() => setTagWindowSelected(!tagWindowSelected)}
                footer={() => footerTag}/>
              </View>
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>날짜/시간</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeSectionContainer}>
                  <View style={styles.timeLineContainer}>
                    <Controller 
                      control={control}
                      name='isAllDay'
                      render={({ field: { value, onChange } }) => (
                        <>
                        <View style={{flexDirection:"row"}}>
                          <ScheduleIcon/><Text style={{marginLeft: 10}}>하루종일</Text>
                        </View>
                        <Switch 
                        thumbColor={value ? Colors.Pink : "#ededed"} trackColor={{false: "#b2b2b2", true: "#FE9CBD"}}
                        onChange={() => {
                          onChange(!value);
                        }}
                        value={getValues('isAllDay')}></Switch>
                        </>)}
                      />
                  </View>
                  <View style={styles.timeLineContainer}>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Pressable style={styles.timeBox} onPress={() => {
                          setTimePickerSelected(true);
                          setTimePickerMode('date');
                        }}>
                          <Text>{value}</Text>
                        </Pressable>
                      )}
                    />
                    <Controller
                      control={control}
                      name="time"
                      render={({ field: { value } }) => (
                        <Pressable style={styles.timeBox} onPress={() =>{
                          setTimePickerSelected(true);
                          setTimePickerMode('time');
                        }} disabled={isAllDay}>
                          <Text style={{color: isAllDay ? Colors.Gray838383: Colors.Black}}>{timeStringConverter(value)}</Text>
                        </Pressable>
                      )}
                    />
                    {timePickerSelected && (
                      <DateTimePicker
                        value={date}
                        mode={timePickerMode as any}
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                          const currentDate = selectedDate || date;
                          setTimePickerSelected(false);
                          setDate(currentDate);
                        }}
                      />
                    )}
                  </View>
                </View>
                {Separator}
                <View style={styles.timeSectionContainer}>
                  <View style={{...styles.timeLineContainer, height: 30}}>                      
                    <View style={{flexDirection:"row"}}>
                      <PaletteIcon/>
                      <Text style={{ marginLeft: 10}}>색상</Text>
                    </View>
                    <View style={{flexDirection:"row", alignItems: "center"}}>
                      <View style={[styles.colorCircle, {backgroundColor: color}]}/>                      
                      <Pressable onPress={() => {
                        setColorWindowSelected(true);
                      }}>
                        <RightArrow/>
                      </Pressable>
                    </View>
                  </View>
                </View>
                <BottomModal
                isVisible={colorWindowSelected}
                onClose={() => setColorWindowSelected(!colorWindowSelected)}
                footer={() => footerColor}/>
                {Separator}
                <View style={styles.timeSectionContainer}>
                  <View style={{...styles.timeLineContainer, height: 30}}>
                    <Controller
                      control={control}
                      name="isUsingAlarm"
                      render={({ field: { value, onChange } }) => (
                        <>
                        <View style={{flexDirection:"row"}}>
                          <AlarmIcon stroke={value ? Colors.Black : Colors.Gray838383}/>
                          <Text style={{color: value? Colors.Black : Colors.Gray838383 , marginLeft: 10}}>알람</Text>
                        </View>
                        <Switch
                        thumbColor={value ? Colors.Pink : "#ededed"} trackColor={{false: "#b2b2b2", true: "#FE9CBD"}} 
                        onChange={() => { onChange(!value);}}
                        value={value}></Switch>
                        </> )} />
                  </View>
                </View>
                {Separator}
                <View style={styles.timeSectionContainer}>
                  <View style={{...styles.timeLineContainer, height: 30}}>
                    <View style={{flexDirection:"row"}}>
                      <RepeatIcon/>
                      <Text style={{ marginLeft: 10, color: repeat == null ? Colors.Gray838383 : Colors.Black}}>{repeatText}반복</Text>
                    </View>
                    <Pressable onPress={() => {
                      setRepeatWindowSelected(true);
                    }}>
                      <RightArrow/>
                    </Pressable>
                    <BottomModal
                      isVisible={repeatWindowSelected}
                      onClose={() => setRepeatWindowSelected(!repeatWindowSelected)}
                      footer={() => footerRepeat}/>
                    {ColorPickerModal}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </FormProvider>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddTodo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  inputWrap: {
    flex: 1,
    width: "100%",
    marginTop: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#D8D8D8',
    borderStyle: 'dashed',
    width: '95%',
  },
  petSelectContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  toDoTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginTop: 10,
    marginRight: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#F1F1F1',
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  footerTagContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 50,
  },
  timeContainer: {
    marginTop: 10,
    marginRight: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#F1F1F1',
  },
  timeSectionContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  timeLineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomModalContainer: {
    marginTop: 15,
    justifyContent: 'center',
  },
  footerCircleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 30,
    width: 480,
    height: 140,
  },
  footerRepeatContainer: {
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
  footerRepeatLineContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 50,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,

  },
  footerRepeatWeekDayContainer: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 30,
    marginBottom: 10,
    borderWidth: 1,
  },
  colorSectionContainer: {
    marginTop: 70,
    paddingHorizontal: 24,

  },
  selectedTag: {
    backgroundColor: Colors.Pink,
  },
  notSelectedTag: {
    backgroundColor: Colors.White,
    borderColor: Colors.Pink,
    borderWidth: 1,
  },
  pet: {
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    borderRadius: 40,
    marginTop: 0,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.Pink,
    borderWidth: 1,
  },
  selectedPet: {
    backgroundColor: Colors.Pink,
  },
  notSelectedPet: {
    backgroundColor: Colors.White,
  },
  timeBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
    height: 50,
    marginTop: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
  },
  footerTopLine: {
    backgroundColor: '#838383',
    height: 1.5,
    width: 50,
    alignSelf: "center",
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  footerOuterCircle: {
    width : 50,
    height : 50,
    borderRadius : 25,
    borderWidth : 1,
    justifyContent : 'center',
    alignItems : 'center',
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  footerColorCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterCircle: {
    width : 20,
    height : 20,
    borderRadius : 10,
    borderWidth : 1,
    justifyContent : 'center',
    alignItems : 'center',
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    borderColor : Colors.Pink,
  },
  radioInnerCircle: {
    width : 10,
    height : 10,
    borderRadius : 5,
    backgroundColor : Colors.Pink,
  },
  footerRepeatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
    height: 50,
    marginTop: 10,
    backgroundColor: Colors.Pink,
    borderRadius: 10,
  },
});
