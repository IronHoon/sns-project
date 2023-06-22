import React, { Dispatch, SetStateAction } from 'react';
import { Lock } from 'views';
interface LockPageProps {
  setPassCode: Dispatch<SetStateAction<boolean>>;
  bioauth: boolean;
  setBioAuth: Dispatch<SetStateAction<boolean>>;
}
export default function LockPage({ setPassCode, bioauth, setBioAuth }: LockPageProps) {
  return <Lock setPassAuth={setPassCode} bioauth={bioauth} setBioAuth={setBioAuth} />;
}
