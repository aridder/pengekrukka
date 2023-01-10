import { VerifiableCredential, VerifiableCredentialType } from "@pengekrukka/vc-shared";
import icons from "react-icons";
import * as featherIcons from "react-icons/fa";
import { toReadableDate } from "../utils";

const Icon = (props: { type: VerifiableCredentialType; className: string }) => {
  const Icons: { [key in VerifiableCredentialType]: icons.IconType } = {
    GlassesProofCredential: featherIcons.FaHeart,
    VerifiableCredential: featherIcons.FaUserCheck,
    WelfareCredential: featherIcons.FaLifeRing,
    PersonCredential: featherIcons.FaUser,
  };

  const Component = Icons[props.type];
  return (
    <div className={props.className}>
      <Component />
    </div>
  );
};
/**
 * fugly way of getting a color
 * acceptable because it's a hackathon
 */
const getColor = (type: VerifiableCredentialType) => {
  if (type === "GlassesProofCredential") {
    return "rgb(6,57,112)";
  }

  if (type === "WelfareCredential") {
    return "rgb(226,135,67)";
  }

  if (type === "VerifiableCredential") {
    return "rgb(82, 247, 89)";
  }

  return "rgb(243, 30, 226)";
};

/**
 * fugly way of getting a title
 * acceptable because it's a hackathon
 */
const getTitle = (type: VerifiableCredentialType) => {
  if (type === "GlassesProofCredential") {
    return "Brillebevis :)";
  }

  if (type === "WelfareCredential") {
    return "Støtte fra pengekrukka";
  }

  if (type === "PersonCredential") {
    return "Personlig ID";
  }

  if (type === "VerifiableCredential") {
    return "Standard VC";
  }

  return "Standard VC uten type";
};

type Props = { vc: VerifiableCredential };
export const VcCard = ({ vc }: Props) => (
  <div
    className="border-1 grid h-56 w-96  grid-cols-1 rounded-xl border-black text-cyan-50"
    style={{ backgroundColor: getColor(vc.types) }}
  >
    <Icon type={vc.type as VerifiableCredentialType} className="flex place-self-end px-3"></Icon>
    <p className="p-10 text-lg font-bold">{getTitle(vc.type as VerifiableCredentialType)}</p>
    <div className="place-self-end px-4">{toReadableDate(vc.issuanceDate)} </div>
  </div>
);
