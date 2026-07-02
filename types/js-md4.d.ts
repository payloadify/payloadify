declare module "js-md4" {
  type Message = string | number[] | ArrayBuffer | Uint8Array;
  function md4(message: Message): string;
  export default md4;
}
