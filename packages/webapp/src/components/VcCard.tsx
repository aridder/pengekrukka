import { BaseSubject, VerifiableCredentialType } from "@pengekrukka/vc-shared";

type Props = { subject: BaseSubject; types: VerifiableCredentialType[] };

const TypeList = (props: { types: VerifiableCredentialType[] }) => (
  ///TODO: add icons
  <div>
    {props.types.map((type) => (
      <div>{type}</div>
    ))}
  </div>
);

export const VcCard = (props: Props) => (
  <div className="relative m-auto h-56 w-96 transform rounded-xl bg-red-500 text-white">
    <TypeList types={props.types} />
    <p className="px-7">{props.subject.title}</p>
    <div>{props.subject.expirationDate}</div>
  </div>
);
