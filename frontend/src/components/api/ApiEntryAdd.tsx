import {
  Box,
  Button,
  Group,
  TextInput,
  Stack,
  NumberInput,
  Switch,
} from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useForm, useId } from "@mantine/hooks"
import React, { ReactElement } from "react"
import { FC } from "react"
import InputBoolean from "../form/InputBoolean"
import InputColor from "../form/InputColor"
import InputDateTime from "../form/InputDateTime"
import InputEnum from "../form/InputEnum"
import InputNotImplemented from "../form/InputNotImplemented"
import InputApiEntry from "./InputApiEntry"

const mapping: { [key: string]: React.ReactNode } = {
  string: <TextInput />,
  number: <NumberInput />,
  boolean: <InputBoolean />,
  enum: <InputEnum />,
  color: <InputColor />,
  date: <DatePicker />,
  datetime: <InputDateTime />,
  apiEntry: <InputApiEntry />,
  productcomponent: <InputNotImplemented />,
  productcomponents: <InputNotImplemented />,
  image: <InputNotImplemented />,
  file: <InputNotImplemented />,
  files: <InputNotImplemented />,
  workstations: <InputNotImplemented />,
  employees: <InputNotImplemented />,
  submit: <InputNotImplemented />,
}

interface ApiEntryAddProps {
  schema: any
}

const ApiEntryAdd: FC<ApiEntryAddProps> = ({ schema }) => {
  const uuid = useId()
  let initialValues: any = {}
  for (const key in schema) {
    initialValues[key] = schema[key]?.initialValue
  }
  const form = useForm({
    initialValues: initialValues,
  })

  return (
    <Box
      // sx={{ maxWidth: 300 }}
      mx="auto"
    >
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Stack>
          {Object.keys(schema).map((key: string, index: number) => {
            if (!schema[key]?.hidden && mapping[schema[key]?.type]) {
              const new_schema = { ...schema[key] }
              delete new_schema.type
              delete new_schema.initialValue
              return (
                <div key={`${uuid}_${key}`}>
                  {React.cloneElement(
                    mapping[schema[key].type] as ReactElement<any, any>,
                    {
                      ...new_schema,
                      ...form.getInputProps(key),
                    }
                  )}
                </div>
              )
              // return <TextInput {...schema[key]} {...form.getInputProps(key)} />
            }
          })}
          <Group position="right" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    </Box>
  )
}

export default ApiEntryAdd
