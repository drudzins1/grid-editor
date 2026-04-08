import svgPaths from "./svg-pliowvw0c7";

function Frame3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0" data-name="Button">
        <div aria-hidden="true" className="absolute border border-[#8d9bb6] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-left">
          <div className="absolute inset-[21.88%_34.38%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.25 11.25">
              <path clipRule="evenodd" d={svgPaths.p23220900} fill="var(--fill-0, #63708A)" fillRule="evenodd" id="Icon" />
            </svg>
          </div>
        </div>
        <p className="font-['Inter',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#313b4d] text-[14px] whitespace-nowrap">Back</p>
      </div>
      <div className="h-[26.5px] relative shrink-0 w-0">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 26.5">
            <path d="M0.5 0V26.5" id="Vector 92" stroke="var(--stroke-0, #D4D4D4)" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] whitespace-nowrap">
        <p className="leading-[28px]">This is the campaign name</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[2px] py-[10px] relative shrink-0" data-name="Frame">
      <div className="relative shrink-0 size-[24px]" data-name="Icons/Utilities/undo">
        <div className="absolute inset-[20.08%_5.21%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5003 14.362">
            <path clipRule="evenodd" d={svgPaths.p13a4c870} fill="var(--fill-0, #1856ED)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[2px] py-[10px] relative shrink-0" data-name="Frame">
      <div className="relative shrink-0 size-[24px]" data-name="Icons/Utilities/redo">
        <div className="absolute flex inset-[20.08%_5.21%] items-center justify-center">
          <div className="-scale-y-100 flex-none h-[14.362px] rotate-180 w-[21.5px]">
            <div className="relative size-full" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5003 14.362">
                <path clipRule="evenodd" d={svgPaths.p13a4c870} fill="var(--fill-0, #1856ED)" fillRule="evenodd" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center px-[2px] py-[3px] relative shrink-0" data-name="Frame">
      <div className="flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1856ed] text-[12px] whitespace-nowrap">
        <p className="leading-[20px]">{`Preview & Test`}</p>
      </div>
      <div className="relative shrink-0 size-[24px]" data-name="Icons/Utilities/chevronSouth">
        <div className="absolute inset-[36.46%_26.04%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.5 6.5">
            <path clipRule="evenodd" d={svgPaths.pd715540} fill="var(--fill-0, #1856ED)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonBase() {
  return (
    <div className="bg-[#186ded] content-stretch flex gap-[8px] items-center justify-center pl-[8px] pr-[16px] py-[6px] relative rounded-[8px] shrink-0" data-name="Button Base">
      <div className="relative shrink-0 size-[19px]" data-name="Icons/Objects/sent">
        <div className="absolute inset-[6.25%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.625 16.625">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p22dafc70} fill="var(--fill-0, white)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2b0f2e00} fill="var(--fill-0, white)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Prepare to send</p>
      </div>
    </div>
  );
}

function Actions() {
  return (
    <div className="bg-[#186ded] content-stretch flex h-[36px] items-center justify-center relative rounded-[8px] shrink-0" data-name="Actions">
      <ButtonBase />
    </div>
  );
}

function ActionsFrame() {
  return (
    <div className="content-stretch flex gap-[20px] items-center justify-center py-[4px] relative shrink-0" data-name="Actions Frame">
      <div className="content-stretch flex h-[44px] items-start relative rounded-[4px] shrink-0" data-name="Actions">
        <Frame />
      </div>
      <div className="content-stretch flex h-[44px] items-start relative rounded-[4px] shrink-0" data-name="Actions">
        <Frame1 />
      </div>
      <div className="content-stretch flex gap-[8px] h-[46px] items-center justify-center opacity-30 px-[24px] py-[12px] relative rounded-[64px] shrink-0" data-name="Actions">
        <div className="relative shrink-0 size-[22px]" data-name="cloud">
          <div className="absolute inset-[15.75%_4.29%_17.83%_4.29%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1117 14.6117">
              <path clipRule="evenodd" d={svgPaths.p38938c00} fill="var(--fill-0, #1856ED)" fillRule="evenodd" id="Icon" />
            </svg>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Typography">
          <p className="font-['Inter',sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#1856ed] text-[12px] whitespace-nowrap">Saved</p>
        </div>
      </div>
      <div className="content-stretch flex h-[30px] items-start relative rounded-[4px] shrink-0" data-name="Actions">
        <Frame2 />
      </div>
      <Actions />
    </div>
  );
}

function ArtifactPageHeader() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px relative rounded-[100px]" data-name="Artifact Page Header">
      <Frame3 />
      <ActionsFrame />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative">
      <ArtifactPageHeader />
    </div>
  );
}

export default function EditorHeaderSaveButton() {
  return (
    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full" data-name="Editor Header - Save button">
      <div aria-hidden="true" className="absolute bg-white inset-0 pointer-events-none" />
      <Frame4 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#e3e3e3]" />
    </div>
  );
}