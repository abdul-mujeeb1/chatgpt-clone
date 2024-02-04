import { useUser } from "@auth0/nextjs-auth0/client";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function Message({role, content}) {
    const { user } = useUser();

    return (
        <div className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${role === "assisant" ? "bg-gray-600" : ""}`}>
        <div className="">
            { role === "user" && !!user && 
                <Image src={user.picture} width={30} height={30} className="user-avatar" alt="User Avatar" />
            }
            {role=== "assistant" &&
            <div className="flex h-[30px] w-[30px] justify-center user-avatar">
                <FontAwesomeIcon icon={faRobot} />
            </div> 
            }
        </div>
        <div className="prose prose-invert">
            <ReactMarkdown>
            {content}
            </ReactMarkdown>
            </div>
        </div>
    );
}