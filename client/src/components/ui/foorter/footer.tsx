import { FlexibleImage, Link } from '@/components/ui';
import { Facebook } from 'lucide-react';
import appstoreImg from '@/../public/appstore.png';
import footerLogoImg from '@/../public/footer_logo.png';

const contactsLinks = {
  contacts: [
    {
      content: 'info@prometheus.org.ua',
      href: 'mailto:info@prometheus.org.ua',
    },
    { content: '+380675687433', href: 'tel:+380675687433' },
  ],
  social: [
    {
      content: <Facebook />,
      href: 'https://www.facebook.com/1',
    },
    {
      content: <Facebook />,
      href: 'https://www.facebook.com/2',
    },
    {
      content: <Facebook />,
      href: 'https://www.facebook.com/3',
    },
    {
      content: <Facebook />,
      href: 'https://www.facebook.com/4',
    },
  ],
};

const infoLinks = [
  [
    {
      content: 'About us1',
      href: 'prometheus.org.ua',
    },
    {
      content: 'Documents',
      href: 'prometheus.org.ua',
    },
    {
      content: 'About us2',
      href: 'prometheus.org.ua',
    },
    {
      content: 'About us3',
      href: 'prometheus.org.ua',
    },
  ],
  [
    {
      content: 'About us4',
      href: 'prometheus.org.ua',
    },
    {
      content: 'About us5',
      href: 'prometheus.org.ua',
    },
    {
      content: 'About us6',
      href: 'prometheus.org.ua',
    },
    {
      content: 'About us7',
      href: 'prometheus.org.ua',
    },
  ],
];

export const Footer = () => {
  return (
    <footer
      className='w-full py-8 mt-10
    bg-footer text-footer-foreground rounded-t-2xl'
    >
      <div className={'flex flex-col gap-6 container'}>
        <div
          className='flex md:justify-between flex-row max-md:flex-col max-md:gap-8
      order-1 max-md:order-2
      '
        >
          {/*contacts*/}
          <div className='flex-col gap-12 max-md:order-last'>
            <div className='flex flex-col mb-4'>
              {contactsLinks.contacts.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.content}
                </Link>
              ))}
            </div>
            <div className='flex gap-3'>
              {contactsLinks.social.map((link) => (
                <Link
                  href={link.href}
                  key={link.href}
                  className='border border-primary-foreground rounded-[99999px] p-1'
                >
                  {link.content}
                </Link>
              ))}
            </div>
          </div>
          {/*general info*/}
          {infoLinks.map((linksList, index) => (
            <div className='flex flex-col gap-3' key={index}>
              {linksList.map((link) => (
                <Link href={link.href} key={link.content}>
                  {link.content}
                </Link>
              ))}
            </div>
          ))}
          {/*payments*/}
          <div
            className={
              'flex justify-start gap-2 lg:flex-col lg:max-w-24 lg:ml-52'
            }
          >
            <Link href={''}>
              <FlexibleImage
                className={'lg:w-full'}
                src={appstoreImg}
                alt={'Appstore link'}
              />
            </Link>
            <Link href={''}>
              <FlexibleImage src={appstoreImg} alt={'Appstore link'} />
            </Link>
          </div>
        </div>
        {/*logo and link to landing*/}
        <div className='flex justify-between items-end lg:order-2 order-1 max-md:block'>
          <FlexibleImage
            src={footerLogoImg}
            alt={'Logo footer'}
            className={'h-auto w-96 max-md:w-52'}
          />
          <Link className={'max-md:hidden'} href={'/'}>
            © 2025 Prometheus
          </Link>
        </div>
      </div>
    </footer>
  );
};
