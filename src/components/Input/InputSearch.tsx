import React, {Dispatch, SetStateAction} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { InputIcon } from '../../assets/svg';
import { Colors } from '../../styles/Colors';

interface IProps {
    name: string;
    defaultValue?: string;
    placeholder: string;
    value: string;
    setValue : Dispatch<SetStateAction<string>>;
}

const InputSearch = ({value, setValue, name, defaultValue = " ", placeholder = "직접 입력하세요"}: IProps) => {
    const { control } = useForm();

    //TODO: 검색기능 추가
    return (
      <View style={styles.container}>
        <Controller
          render={({ field: { onChange, onBlur } }) => (
            <>
              <InputIcon style={{ marginHorizontal: 16 }} />
              <TextInput
                placeholder={placeholder}
                onBlur={onBlur}
                value={value}
                onChangeText={(text) => {
                    setValue(text);
                    onChange(text)
                }}
                style={{ flex: 1, flexGrow: 1, paddingRight: 16 }}
              />
            </>
          )}
          name={name}
          control={control}
          defaultValue={defaultValue}
        />
      </View>
    );
};

export default InputSearch;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Colors.F1F1F1,
        borderRadius: 10,
        flexDirection: "row",
        paddingVertical: 16,
    }
})