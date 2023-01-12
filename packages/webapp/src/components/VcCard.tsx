import icons from "react-icons";
import * as featherIcons from "react-icons/fa";
import { VerifiableCredential } from "../server/trpc/schemas";
import { VerifiableCredentialType } from "../server/trpc/vc-shared";
import { toReadableDate } from "../utils";

const Icons: { [key in VerifiableCredentialType]: icons.IconType } = {
  GlassesProofCredential: featherIcons.FaHeart,
  VerifiableCredential: featherIcons.FaUserCheck,
  WelfareCredential: featherIcons.FaLifeRing,
  PersonCredential: featherIcons.FaUser,
};

/**
 * fugly way of getting a color
 * acceptable because it's a hackathon
 */
const getColor = (types: VerifiableCredentialType[]) => {
  if (types.includes(VerifiableCredentialType.GlassesProofCredential)) {
    return "rgb(6,57,112)";
  }

  if (types.includes(VerifiableCredentialType.WelfareCredential)) {
    return "rgb(226,135,67)";
  }

  if (types.includes(VerifiableCredentialType.VerifiableCredential)) {
    return "rgb(82, 247, 89)";
  }

  return "rgb(243, 30, 226)";
};

/**
 * fugly way of getting a title
 * acceptable because it's a hackathon
 */
const getTitle = (types: VerifiableCredentialType[]) => {
  if (types.includes(VerifiableCredentialType.GlassesProofCredential)) {
    return "Brillebevis :)";
  }

  if (types.includes(VerifiableCredentialType.WelfareCredential)) {
    return "Støtte fra pengekrukka";
  }

  if (types.includes(VerifiableCredentialType.PersonCredential)) {
    return "Personlig ID";
  }

  if (types.includes(VerifiableCredentialType.VerifiableCredential)) {
    return "Standard VC";
  }

  return "Standard VC uten type";
};

const IconList = (props: { type: VerifiableCredentialType[]; className: string | undefined }) => (
  <div className={props.className}>
    {props.type
      .map((type) => Icons[type])
      .map((Icon, index) => (
        <Icon size={20} key={index} />
      ))}
  </div>
);

type Props = { vc: VerifiableCredential };
export const VcCard = ({ vc }: Props) => (
  <div
    className="border-1 grid h-56 w-96  grid-cols-1 rounded-xl border-black text-cyan-50"
    style={{ backgroundColor: getColor(vc.type) }}
  >
    <IconList type={vc.type as []} className="flex place-self-end px-3" />
    <p className="p-10 text-lg font-bold">{getTitle(vc.type as [])}</p>
    <div className="place-self-end px-4">{toReadableDate(vc.issuanceDate)} </div>
  </div>
);
