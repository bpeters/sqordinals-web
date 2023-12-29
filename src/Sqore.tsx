import { useState, useEffect } from "react"
import _ from 'lodash';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  Icon,
  Input,
  IconButton,
  Tooltip,
  Select,
} from "@chakra-ui/react"
import { useParams, useNavigate, createSearchParams, useLocation } from 'react-router-dom';

import { SqordinalSqore } from "./SqordinalSqore";

let chunks: any = [];
let recorder: any;

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const Sqore = (props: any) => {
  const track = props.track;
  const navigate = useNavigate();

  const [canvas, setCanvas]: any = useState(null);
  const [sqord, setSqord]: any = useState(null);
  const [set, setSet]: any = useState(0);

  return (
    <VStack
      justify={'center'}
      align={'center'}
    >
      <SqordinalSqore
        track={track}
        set={set}
        setCanvas={setCanvas}
        setSqord={setSqord}
        setSet={setSet}
      />
    </VStack>
  )
};
