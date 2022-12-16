import React from "react";

//FIXME: move to separate file when this grows
const Header = () => <div>TODO HEADER</div>;
//FIXME: move to separate file when this grows
const Footer = () => <div>TODO FOOTER</div>;

export const Layout = (props: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      {props.children}
      <Footer />
    </>
  );
};
