import { useCallAnyContract } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";

// Note: Test file. Do not deploy.
export default function TestPage() {
    const { callAnyContractAsync } = useCallAnyContract();
    // Implementation ...
}
