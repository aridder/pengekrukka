import { type NextPage } from "next";
import Link from "next/link";
import Layout from "../components/layout/Layout";

type Site = {
  name: string;
  link: `/${string}`;
  description: string;
};

/**
 * This array specifies the pages that are relevant
 * for the demo of Pengekrukka. The content is intended
 * to be rendered. In other words, they should explain
 * to the user why they would use the site.
 */
export const sites: Site[] = [
  {
    name: "Doctor's Office",
    link: "/doctor",
    description: "Visit the doctor to see if you need glasses",
  },
  {
    name: "Government Moneyjar",
    link: "/welfare",
    description: "Use the proof from the doctor to get support for buying glasses",
  },
  {
    name: "Optician's Store",
    link: "/optician",
    description: "Use proof from the Moneyjar to get discount on glasses",
  },
  {
    name: "National Id Register",
    link: "/folkeregisteret",
    description: "Get a personal ID from government",
  },
];

const SiteList = (props: { sites: Site[] }) => {
  return (
    <div>
      {props.sites.map((site) => (
        <Link
          href={site.link}
          className="m-5 mx-auto flex max-w-sm items-center space-x-4 rounded-xl bg-white p-5 shadow-md"
          id={site.name}
        >
          <div>
            <div className="text-slate-500">{site.name}</div>
            <div className="font-small text-sm text-black">{site.description}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <Layout>
      <SiteList sites={sites} />
    </Layout>
  );
};

export default Home;
