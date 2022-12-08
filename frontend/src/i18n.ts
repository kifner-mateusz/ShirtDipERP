import common_pl from "./locales/pl/common.json"
import common_en from "./locales/en/common.json"

import i18next from "i18next"
import {
  initReactI18next,
  useTranslation as useTranslationReact,
  UseTranslationOptions,
} from "react-i18next"

import "dayjs/locale/pl"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import relativeTime from "dayjs/plugin/relativeTime"
import isToday from "dayjs/plugin/isToday"
import customParseFormat from "dayjs/plugin/customParseFormat"

export const defaultNS = "translation"
export const resources = {
  en: {
    translation: common_en,
  },
  pl: {
    translation: common_pl,
  },
} as const

const i18n = i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: "pl",
  // debug: true,
  resources,
  defaultNS,
})

//wait for i18n initialization to get current locale
i18n.then(() => {
  dayjs.locale(i18next.language)
  console.log("locale: ", i18next.language)
})
dayjs.extend(localizedFormat)
dayjs.extend(isToday)
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

export default i18n

// remove tsc for translation as it is unreasonably slow
export function useTranslation(ns?: any, options?: UseTranslationOptions<any>) {
  // @ts-ignore
  const elems = useTranslationReact(ns, options)

  return elems
}
