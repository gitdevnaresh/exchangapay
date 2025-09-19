import { useSelector } from 'react-redux';

const useGetMemberId = () => {
  return useSelector((state: any) => state?.auth?.member?.id);
};

export default useGetMemberId;
