"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import styles from './header.module.css'; // Импортируем наш CSS-модуль

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  // Пример ссылок для меню
  // {
  //   label: "Home",
  //   href: "/",
  // },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className={styles.menu__item + (isActive ? ` ${styles.menu__item} active` : '')}>
            <Link
              href={href}
              passHref
              className="flex items-center gap-2"
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className={styles.header}>
      <div className={styles.header__start}>
        <div className={styles.burgerMenu} ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`${styles.burgerMenu__label} ${isDrawerOpen ? 'open' : ''}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-6 w-6" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className={styles.header__logo}>
          <div className={styles.header__logo__img}>
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className={styles.header__logo__text}>Voting project</span>
          </div>
        </Link>
        <ul className={styles.header__menu}>
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className={styles.header__end}>
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
