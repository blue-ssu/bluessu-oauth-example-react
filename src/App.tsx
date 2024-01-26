import { Button } from "./components/ui/button";
import BlueSSULogo from "./assets/bluessu.png";
import { useState } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import axios from "axios";
import { toast } from "sonner";

const fetchGetToken = async (code: string) => {
    const response = await axios.post(
        `${import.meta.env.VITE_BLUESSU_CORE_URL}/oauth/token`,
        {
            clientId: localStorage.getItem("clientId"),
            clientSecret: localStorage.getItem("clientSecret"),
            code,
        }
    );
    return (await response.data) as {
        token: {
            accessToken: string;
            refreshToken: string;
        };
    };
};

const fetchGetUser = async (accessToken: string) => {
    const response = await axios.get(
        `${import.meta.env.VITE_BLUESSU_CORE_URL}/oauth/profile`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return (await response.data) as {
        user: {
            name: string;
            studentId: string;
            department: string;
            profileImage: string;
        };
    };
};

function App() {
    const [clientId, setClientId] = useState(
        localStorage.getItem("clientId") || ""
    );
    const [clientSecret, setClientSecret] = useState(
        localStorage.getItem("clientSecret") || ""
    );
    const redirectURL = `${window.location.origin}`;

    localStorage.setItem("clientId", clientId);
    localStorage.setItem("clientSecret", clientSecret);

    const code = new URLSearchParams(window.location.search).get("code");
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const getToken = async () => {
        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) return;
        setIsLoading(true);
        try {
            const res = await fetchGetToken(code);
            toast.success("토큰 교환에 성공했어요");
            setAccessToken(res.token.accessToken);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    const [user, setUser] = useState<{
        name: string;
        studentId: string;
        department: string;
        profileImage: string;
    } | null>(null);
    const getUser = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            const res = await fetchGetUser(accessToken);
            setUser(res.user);
            toast.success("유저 조회에 성공했어요");
            console.log(res);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <div className="w-[100dvw] h-[100dvh] flex flex-col items-center justify-center gap-2">
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                BlueSSU OAuth Example
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>Client</h2>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <Label>Client ID</Label>
                        <Input
                            placeholder="Client ID"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Client Secret</Label>
                        <Input
                            placeholder="Client Secret"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Redirect URL</Label>
                        <Input
                            placeholder="Client ID"
                            value={`${redirectURL}`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>OAuth 로그인</h2>
                <div className="flex flex-col gap-1">
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        disabled={!clientId || !clientSecret}
                        onClick={() =>
                            (window.location.href = `${
                                import.meta.env.VITE_BLUESSU_OAUTH_URL
                            }/oauth?client_id=${clientId}&redirect_url=${redirectURL}`)
                        }
                    >
                        <img src={BlueSSULogo} className="w-[24px] h-[24px]" />
                        BlueSSU로 로그인
                    </Button>
                    <div className="text-muted-foreground text-[12px] text-center">
                        {import.meta.env.VITE_BLUESSU_OAUTH_URL}
                        /oauth?client_id=
                        {clientId}&redirect_url={redirectURL}
                    </div>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>로그인 확인</h2>
                <div className="flex flex-col gap-2">
                    <div className="text-muted-foreground text-[12px] text-center">
                        code: {code ? "YES" : "NO"}
                        <br />
                        accessToken: {accessToken ? "YES" : "NO"}
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        onClick={() => getToken()}
                        disabled={!code || isLoading}
                    >
                        토큰 교환
                    </Button>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>유저 조회</h2>
                <div className="flex flex-col gap-2">
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        onClick={() => getUser()}
                        disabled={!accessToken || isLoading}
                    >
                        조회
                    </Button>
                    {user && (
                        <div className="flex items-center gap-2 m-auto border rounded px-4 py-2">
                            <img
                                src={user.profileImage}
                                alt=""
                                className="w-[40px] h-[40px]"
                            />
                            <div className="flex flex-col ">
                                <div className="font-medium text-sm">
                                    {user.department} {user.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {user.studentId}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
