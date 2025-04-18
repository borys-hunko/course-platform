import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className='container grid md:grid-cols-2 max-md:gap-3'>
      <div className={'my-auto max-md:order-2'}>
        <h1
          className='text-card-foreground text-6xl font-black tracking-tighter
            uppercase max-md:text-4xl max-md:text-center'
        >
          Build your career course by course
        </h1>
        <p
          className='lg:mt-8 md:mt-7 mt-6 font-normal lg:max-w-[65%] text-card-foreground
          max-md:text-center max-md:font-medium
          '
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius
          imperdiet dolor, ac condimentum ligula consectetur nec. Nulla semper
          rutrum turpis sed pretium. Maecenas sit amet sollicitudin enim, eget
          pretium nibh. Aenean volutpat lectus et tellus faucibus venenatis.
          Nulla hendrerit nunc consequat, sagittis arcu et, laoreet felis.
          Aliquam vehicula placerat mi et facilisis.
        </p>
        <Button variant={'secondary'} className='w-48 mt-9 max-md:hidden'>
          Join
        </Button>
      </div>
      <video
        autoPlay={true}
        muted={true}
        loop={true}
        playsInline={true}
        disablePictureInPicture={true}
        preload='auto'
        className='max-md:order-1 w-full aspect-square'
        width={495}
        height={396}
      >
        <source src={'/animation_main_optimized.mp4'} type={'video/mp4'} />
      </video>
      <div
        className={
          'grid grid-cols-2 grid-rows-2 gap-5 max-md:hidden mt-12 font-sans'
        }
      >
        <div
          className='p-6 flex gap-2
        flex-col justify-around items-start
        rounded-2xl bg-foreground
        text-secondary-foreground
        '
        >
          <h3 className={'font-black text-5xl tracking-tighter'}>3 200 000</h3>
          <p>students</p>
        </div>
        <div
          className='p-6 flex gap-2
        flex-col justify-around items-start
        rounded-2xl bg-foreground
        text-secondary-foreground
        '
        >
          <h3 className={'font-black text-5xl tracking-tighter'}>
            450 <span className={'text-primary'}>+</span>
          </h3>
          <p>courses</p>
        </div>
        <div
          className='p-6 flex gap-2
        flex-col justify-around items-start
        rounded-2xl bg-foreground
        text-secondary-foreground
        '
        >
          <h3 className={'font-black text-5xl tracking-tighter'}>3 200 000</h3>
          <p>students</p>
        </div>
        <div
          className='p-6 flex gap-2
        flex-col justify-around items-start
        rounded-2xl bg-foreground
        text-secondary-foreground
        '
        >
          <h3 className={'font-black text-5xl tracking-tighter'}>10 years</h3>
          <p>in the industry</p>
        </div>
      </div>
      <div></div>
    </div>
  );
}
