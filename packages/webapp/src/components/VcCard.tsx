import { BaseSubject, VerifiableCredentialType } from "@pengekrukka/vc-shared";
import icons from "react-icons";
import * as featherIcons from "react-icons/fa";
import { toReadableDate } from "../utils";

type Props = { subject: BaseSubject; types: VerifiableCredentialType[] };

const Icons: { [key in VerifiableCredentialType]: icons.IconType } = {
  GlassesProofCredential: featherIcons.FaHeart,
  VerifiableCredential: featherIcons.FaUserCheck,
  WelfareCredential: featherIcons.FaLifeRing,
};

/**
 * fugly way of getting a color
 * acceptable because it's a hackathon
 */
const getColor = (types: VerifiableCredentialType[]) => {
  if (types.includes("GlassesProofCredential")) {
    return "rgb(6,57,112)";
  }

  if (types.includes("WelfareCredential")) {
    return "rgb(226,135,67)";
  }

  if (types.includes("VerifiableCredential")) {
    return "rgb(82, 247, 89)";
  }

  return "rgb(243, 30, 226)";
};

const IconList = (props: { types: VerifiableCredentialType[]; className: string | undefined }) => (
  <div className={props.className}>
    {props.types
      .map((type) => Icons[type])
      .map((Icon) => (
        <Icon size={20} />
      ))}
  </div>
);

export const VcCard = (props: Props) => (
  <div
    className="border-1 grid h-56 w-96  grid-cols-1 rounded-xl border-black text-cyan-50"
    style={{ backgroundColor: getColor(props.types) }}
  >
    <IconList types={props.types} className="flex place-self-end px-3" />
    <p className="p-10 text-lg font-bold">{props.subject.title}</p>
    <div className="place-self-end px-4">{toReadableDate(props.subject.expirationDate)} </div>
  </div>
);
